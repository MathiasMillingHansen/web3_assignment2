import { promises as fs } from 'fs';
import * as path from 'path';

const FILE_DATABASE_PATH = './database';

export async function upsert<T>(table: string, id: string, data: T): Promise<void> {
    let tablePath = path.join(FILE_DATABASE_PATH, table);
    let recordPath = path.join(tablePath, `${id}.json`);
    let dataString = JSON.stringify(data, null, 2);
    await fs.mkdir(tablePath, { recursive: true });
    await fs.writeFile(recordPath, dataString, 'utf-8');
    console.log(`[db] put ${recordPath}`, data);
}

export async function find<T>(table: string, id: string): Promise<T | null> {
    let tablePath = path.join(FILE_DATABASE_PATH, table);
    let recordPath = path.join(tablePath, `${id}.json`);
    try {
        let dataString = await fs.readFile(recordPath, 'utf-8');
        let data = JSON.parse(dataString);
        console.log(`[db] get ${recordPath}`, data);
        return data as T;
    } catch (error: any) {
        if (error.code === 'ENOENT') return null;
        throw error;
    }
}
