
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
