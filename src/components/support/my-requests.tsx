
"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { getTicketsByEmail, updateTicketStatus, type SupportTicket } from "@/lib/support";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusColors: Record<SupportTicket['status'], string> = {
    "New": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "In Review": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "Resolved": "bg-green-500/20 text-green-400 border-green-500/30",
}

function TicketDetailDrawer({ ticket, isOpen, onOpenChange, onStatusChange }: { ticket: SupportTicket | null, isOpen: boolean, onOpenChange: (open: boolean) => void, onStatusChange: () => void }) {
    if (!ticket) return null;

    const handleResolve = () => {
        updateTicketStatus(ticket.email, ticket.id, "Resolved");
        onStatusChange();
        onOpenChange(false);
    }
    
    const DetailRow = ({ label, value }: { label: string, value?: string | number }) => (
        value ? <div className="grid grid-cols-3 gap-2 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="col-span-2 text-foreground break-words">{value}</dd>
        </div> : null
    );

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-[440px] sm:max-w-none flex flex-col">
                <SheetHeader>
                    <SheetTitle>Ticket: {ticket.id}</SheetTitle>
                    <SheetDescription>
                        Submitted on {format(new Date(ticket.createdAt), "PPP 'at' p")}
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto space-y-4 py-4">
                    <DetailRow label="Status" value={ticket.status} />
                    <DetailRow label="Topic" value={ticket.topic} />
                    <DetailRow label="Priority" value={ticket.priority} />
                    <DetailRow label="Subject" value={ticket.subject} />
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <dt className="text-muted-foreground">Description</dt>
                        <dd className="col-span-2 text-foreground whitespace-pre-wrap break-words">{ticket.description}</dd>
                    </div>
                    <DetailRow label="Your Email" value={ticket.email} />
                    <DetailRow label="Display Name" value={ticket.displayName} />
                    <DetailRow label="Reference ID" value={ticket.referenceId} />
                    <DetailRow label="Attachment URL" value={ticket.attachmentUrl} />
                </div>
                <SheetFooter>
                    {ticket.status !== "Resolved" && (
                        <Button onClick={handleResolve}>Mark as Resolved</Button>
                    )}
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}


export function MyRequests() {
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Try to prefill from last search
    const lastEmail = sessionStorage.getItem("support_last_email");
    if(lastEmail) {
        setEmail(lastEmail);
        handleSearch(lastEmail);
    }
  }, []);

  const handleSearch = (searchEmail: string) => {
    if(searchEmail) {
      const userTickets = getTicketsByEmail(searchEmail);
      setTickets(userTickets);
      sessionStorage.setItem("support_last_email", searchEmail);
    } else {
      setTickets([]);
    }
    setHasSearched(true);
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(email);
  }
  
  const handleStatusChange = useCallback(() => {
    handleSearch(email); // Re-fetch and re-render tickets
  }, [email]);
  
  const handleRowClick = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsDrawerOpen(true);
  }

  return (
    <div>
      <h2 className="text-center font-headline text-3xl font-bold mb-4">
        My Requests
      </h2>
      <p className="text-center text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
        Enter the email you used to submit your requests to view their status.
      </p>

      <form onSubmit={handleFormSubmit} className="max-w-sm mx-auto flex gap-2 mb-8">
        <Input
          type="email"
          placeholder="Enter your email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit">View Requests</Button>
      </form>
      
      {hasSearched && (
          <div className="border rounded-lg">
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.length > 0 ? (
                        tickets.map((ticket) => (
                            <TableRow key={ticket.id} onClick={() => handleRowClick(ticket)} className="cursor-pointer">
                                <TableCell className="font-medium">{ticket.id}</TableCell>
                                <TableCell>{ticket.topic}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn("font-normal", statusColors[ticket.status])}>
                                        {ticket.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">{format(new Date(ticket.createdAt), "MMM dd, yyyy")}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                No tickets found for this email address.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </div>
      )}

      <TicketDetailDrawer 
        ticket={selectedTicket}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
