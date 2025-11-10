
"use client";

import { z } from "zod";

export const ticketSchema = z.object({
  userType: z.enum(["visitor", "consultant"]),
  topic: z.string().min(1, "Please select a topic."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters.").max(600, "Description cannot exceed 600 characters."),
  email: z.string().email("Please enter a valid email address."),
  displayName: z.string().optional(),
  priority: z.enum(["normal", "urgent"]).default("normal"),
});

export type TicketFormData = z.infer<typeof ticketSchema>;

export type TicketStatus = "New" | "In Review" | "Resolved";

export interface SupportTicket extends TicketFormData {
  id: string;
  status: TicketStatus;
  createdAt: string; // ISO string
}

function generateTicketId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `AST-${year}${month}-${randomDigits}`;
}

/**
 * Creates a new ticket object and generates an ID. Does not save to localStorage.
 * @param data The form data for the ticket.
 * @returns A new support ticket object.
 */
export function addTicket(data: TicketFormData): SupportTicket {
  const newTicket: SupportTicket = {
    ...data,
    id: generateTicketId(),
    status: "New",
    createdAt: new Date().toISOString(),
  };

  // This function no longer saves to localStorage.
  // The ticket object is returned for immediate use, like showing in a success modal.
  return newTicket;
}
