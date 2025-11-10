
"use client";

import { z } from "zod";
import { getLocal, setLocal } from "./local";

const SUPPORT_TICKETS_KEY = "astrethique_support_tickets_v1";

export const ticketSchema = z.object({
  userType: z.enum(["visitor", "consultant"]),
  topic: z.string().min(1, "Please select a topic."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters.").max(600, "Description cannot exceed 600 characters."),
  email: z.string().email("Please enter a valid email address.").optional().or(z.literal('')),
  displayName: z.string().optional(),
  referenceId: z.string().optional(),
  attachmentUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  priority: z.enum(["normal", "urgent"]).default("normal"),
});

export type TicketFormData = z.infer<typeof ticketSchema>;

export type TicketStatus = "New" | "In Review" | "Resolved";

export interface SupportTicket extends TicketFormData {
  id: string;
  status: TicketStatus;
  createdAt: string; // ISO string
}

type TicketStore = {
  [email: string]: SupportTicket[];
};

function getAllTickets(): TicketStore {
  const allTickets = getLocal<TicketStore>(SUPPORT_TICKETS_KEY) || {};
  if (!allTickets['anonymous']) {
      allTickets['anonymous'] = [];
  }
  return allTickets;
}

function saveAllTickets(store: TicketStore): void {
  setLocal(SUPPORT_TICKETS_KEY, store);
}

function generateTicketId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `AST-${year}${month}-${randomDigits}`;
}

export function addTicket(data: TicketFormData): SupportTicket {
  const allTickets = getAllTickets();
  const userKey = data.email || 'anonymous';
  const userTickets = allTickets[userKey] || [];

  const newTicket: SupportTicket = {
    ...data,
    id: generateTicketId(),
    status: "New",
    createdAt: new Date().toISOString(),
  };

  const updatedUserTickets = [newTicket, ...userTickets];
  allTickets[userKey] = updatedUserTickets;

  saveAllTickets(allTickets);
  return newTicket;
}

export function getTicketsByEmail(email: string): SupportTicket[] {
  const allTickets = getAllTickets();
  const userKey = email || 'anonymous';
  // Also include anonymous tickets if an email is provided, in case user submitted both ways
  const anonymousTickets = email ? allTickets['anonymous'] || [] : [];
  const userTickets = allTickets[userKey] || [];
  return [...userTickets, ...anonymousTickets].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updateTicketStatus(email: string, ticketId: string, status: TicketStatus): SupportTicket[] {
  const allTickets = getAllTickets();
  const userKey = email || 'anonymous';
  const userTickets = allTickets[userKey] || [];

  const updatedTickets = userTickets.map(ticket =>
    ticket.id === ticketId ? { ...ticket, status } : ticket
  );

  allTickets[userKey] = updatedTickets;
  saveAllTickets(allTickets);
  return updatedTickets;
}
