import axios from 'axios';
import { execSync } from 'child_process';

async function getAllQueuesWithOpenMessages(): Promise<string[]> {
  const response = await axios.get('http://localhost:15672/api/queues', {
    auth: {
      username: 'rabbitmq',
      password: 'rabbitmq',
    },
  });
  return response.data
    .filter((queue: { name: string; messages: number }) => queue.name.endsWith('_QUEUE') && queue.messages > 0)
    .map((queue: { name: string }) => queue.name);
}

async function getMessagesOfQueue(queueName: string): Promise<string[]> {
  const response = await axios.post(
    `http://localhost:15672/api/queues/%2F/${queueName}/get`,
    {
      count: 100,
      requeue: true,
      ackmode: 'ack_requeue_true',
      encoding: 'auto',
    },
    {
      auth: {
        username: 'rabbitmq',
        password: 'rabbitmq',
      },
    },
  );
  const ids = response.data
    .map((message: { payload: string }) => message.payload)
    .map((payload: string) => JSON.parse(payload).id);
  return ids;
}

const checkIfDockerContainerIsRunning = (containerName: string): boolean => {
  const containerId = execSync(`docker ps -aqf "name=${containerName}"`).toString().trim();
  if (!containerId) {
    return false;
  }
  const running = execSync(`docker inspect -f '{{.State.Running}}' ${containerId}`).toString().trim();
  return running === 'true';
};

let allMessageIdsPrevoiuslyReceived: string[] = [];

async function startServicesOnDemand(): Promise<void> {
  setInterval(async () => {
    try {
      const queues = await getAllQueuesWithOpenMessages();
      const allMessages = await Promise.all(
        queues.map(async (queue) => {
          return {
            queue,
            messages: await getMessagesOfQueue(queue),
          };
        }),
      );
      for (const message of allMessages) {
        const doesHaveOldMessages = message.messages.some((messageId) =>
          allMessageIdsPrevoiuslyReceived.includes(messageId),
        );
        if (doesHaveOldMessages) {
          const containerName = message.queue.replace('_QUEUE', '').toLowerCase().replace(/_/g, '-');
          if (!checkIfDockerContainerIsRunning(containerName)) {
            execSync(`npm run docker:only ${containerName}`, { stdio: 'inherit' });
          }
          checkIfDockerContainerIsRunning(containerName);
        }
      }
      allMessageIdsPrevoiuslyReceived = allMessages.map((message) => message.messages).flat();
    } catch (_e) {}
  }, 1500);
}

startServicesOnDemand().catch(console.error);
