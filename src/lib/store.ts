import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { DEFAULT_INSTELLINGEN, Instellingen, Offerte } from "./types";

// Serverless hosts (zoals Vercel) hebben een read-only bestandssysteem
// behalve os.tmpdir(); lokaal blijven we in het project schrijven zodat data
// een dev-server-herstart overleeft. tmpdir is niet persistent tussen
// serverless-invocaties — vervang dit door een echte database voor productie.
const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "offerteflits-data")
  : path.join(process.cwd(), "data");
const OFFERTES_FILE = path.join(DATA_DIR, "offertes.json");
const INSTELLINGEN_FILE = path.join(DATA_DIR, "instellingen.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(file: string, data: T) {
  await ensureDataDir();
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

export async function listOffertes(): Promise<Offerte[]> {
  const offertes = await readJson<Offerte[]>(OFFERTES_FILE, []);
  return offertes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOfferte(id: string): Promise<Offerte | undefined> {
  const offertes = await readJson<Offerte[]>(OFFERTES_FILE, []);
  return offertes.find((o) => o.id === id);
}

export async function saveOfferte(offerte: Offerte): Promise<Offerte> {
  const offertes = await readJson<Offerte[]>(OFFERTES_FILE, []);
  const index = offertes.findIndex((o) => o.id === offerte.id);
  if (index >= 0) {
    offertes[index] = offerte;
  } else {
    offertes.push(offerte);
  }
  await writeJson(OFFERTES_FILE, offertes);
  return offerte;
}

export async function deleteOfferte(id: string): Promise<void> {
  const offertes = await readJson<Offerte[]>(OFFERTES_FILE, []);
  await writeJson(
    OFFERTES_FILE,
    offertes.filter((o) => o.id !== id)
  );
}

export async function nextOfferteNummer(): Promise<string> {
  const offertes = await readJson<Offerte[]>(OFFERTES_FILE, []);
  const year = new Date().getFullYear();
  const countThisYear = offertes.filter((o) => o.offerteNummer.startsWith(`OF-${year}-`)).length;
  return `OF-${year}-${String(countThisYear + 1).padStart(3, "0")}`;
}

export async function getInstellingen(): Promise<Instellingen> {
  return readJson<Instellingen>(INSTELLINGEN_FILE, DEFAULT_INSTELLINGEN);
}

export async function saveInstellingen(instellingen: Instellingen): Promise<Instellingen> {
  await writeJson(INSTELLINGEN_FILE, instellingen);
  return instellingen;
}
