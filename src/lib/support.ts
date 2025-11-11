
import { z } from "zod";

export const ticketSchema = z.object({
  userType: z.enum(["visitor", "consultant"]),
  topic: z.string().min(1, "Please select a topic."),
  subject: z.string().min(5, "Subject must be at least 5 characters.").max(100),
  description: z.string().min(20, "Please provide at least 20 characters of description.").max(600),
  email: z.string().email("Please enter a valid email address."),
  displayName: z.string().optional(),
  priority: z.enum(["normal", "urgent"]),
});

export type TicketFormData = z.infer<typeof ticketSchema>;
