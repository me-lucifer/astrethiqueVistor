
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const PasswordStrength = ({ password = "" }: { password?: string }) => {
  const getStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthValue = (strength / 5) * 100;
  const strengthText = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][strength];
  
  const indicatorColor = 
    strength <= 2 ? "bg-destructive" :
    strength === 3 ? "bg-yellow-500" :
    "bg-success";

  return (
    <div className="space-y-1">
      <Progress value={strengthValue} indicatorClassName={indicatorColor} />
      <span className="text-xs text-muted-foreground">{strengthText}</span>
    </div>
  );
};

export default PasswordStrength;
