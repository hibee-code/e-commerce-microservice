const amqp = require('amqplib');

let connection = null;
let channel = null;

const QUEUE_NAME = 'transaction_queue';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:password@localhost:5672';

const connectRabbitMQ = async () => {
  try {
    if (!connection) {
      connection = await amqp.connect(RABBITMQ_URL);
      console.log('Connected to RabbitMQ');

      connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err);
        connection = null;
        channel = null;
      });

      connection.on('close', () => {
        console.log('RabbitMQ connection closed');
        connection = null;
        channel = null;
      });
    }

    if (!channel) {
      channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      console.log(`Queue '${QUEUE_NAME}' is ready`);
    }

    return channel;
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
};

const publishToQueue = async (data) => {
  try {
    const ch = await connectRabbitMQ();
    const message = JSON.stringify(data);

    ch.sendToQueue(QUEUE_NAME, Buffer.from(message), {
      persistent: true
    });

    console.log('Message published to queue:', data);
  } catch (error) {
    console.error('Failed to publish message to queue:', error);
    throw error;
  }
};

const consumeFromQueue = async (callback) => {
  try {
    const ch = await connectRabbitMQ();

    await ch.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        try {
          const data = JSON.parse(msg.content.toString());
          console.log('Processing message from queue:', data);

          await callback(data);

          ch.ack(msg);
          console.log('Message processed successfully');
        } catch (error) {
          console.error('Error processing message:', error);
          ch.nack(msg, false, false);
        }
      }
    });

    console.log('Started consuming messages from queue');
  } catch (error) {
    console.error('Failed to consume from queue:', error);
    throw error;
  }
};

const closeConnection = async () => {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    console.log('RabbitMQ connection closed');
  } catch (error) {
    console.error('Error closing RabbitMQ connection:', error);
  }
};

module.exports = {
  connectRabbitMQ,
  publishToQueue,
  consumeFromQueue,
  closeConnection,
  QUEUE_NAME
};