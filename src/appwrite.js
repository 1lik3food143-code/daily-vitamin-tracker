import { Client, Databases, ID, Query } from 'appwrite';

export const appwriteConfig = {
  projectId: '6ae282a30022de2df929',
  projectName: 'project',
  endpoint: 'https://sfo.cloud.appwrite.io/v1',
  databaseId: '',
  collectionId: '',
};
const configured = Boolean(appwriteConfig.projectId && appwriteConfig.endpoint);
export const appwriteReady = Boolean(configured && appwriteConfig.databaseId && appwriteConfig.collectionId && !appwriteConfig.databaseId.includes('...') && !appwriteConfig.collectionId.includes('...'));
export const client = new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId);
const databases = new Databases(client);

export function pingAppwrite() {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Appwrite ping timed out after 10 seconds')), 10000);
  });
  return Promise.race([client.ping(), timeout]);
}

export async function loadTasks() {
  if (!appwriteReady) return null;
  const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.collectionId, [Query.orderDesc('$createdAt')]);
  return result.documents.map(({ $id, title, category, due, done }) => ({ id: $id, title, category, due, done }));
}
export async function createTask(task) {
  if (!appwriteReady) return null;
  const doc = await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.collectionId, ID.unique(), task);
  return { id: doc.$id, title: doc.title, category: doc.category, due: doc.due, done: doc.done };
}
export async function updateTask(task) {
  if (appwriteReady) await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.collectionId, String(task.id), { title: task.title, category: task.category, due: task.due, done: task.done });
}
export async function deleteTask(taskId) {
  if (appwriteReady) await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.collectionId, String(taskId));
}
