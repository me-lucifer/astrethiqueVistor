
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const PasswordStrength = ({ password = "" }: { password?: string }) => {
  const getStrength = (password: string) => {
    let score = 0;
    if (!password) return 0;
    if (password.length >= 8) score++;
    if (/[a-zA-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthValue = (strength / 4) * 100;
  
  let strengthText = "Weak";
  let indicatorColor = "bg-destructive";

  if (strength === 2) {
    strengthText = "Fair";
    indicatorColor = "bg-yellow-500";
  } else if (strength === 3) {
    strengthText = "Good";
    indicatorColor = "bg-yellow-500";
  } else if (strength >= 4) {
    strengthText = "Strong";
    indicatorColor = "bg-success";
  }
  
  if (!password) {
    return null;
  }


  return (
    <div 
        className="space-y-1"
        role="meter"
        aria-live="polite"
        aria-label={`Password strength: ${strengthText}`}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={strength}
        aria-valuetext={strengthText}
    >
      <Progress value={strengthValue} indicatorClassName={indicatorColor} />
      <span className="text-xs text-muted-foreground">{strengthText}</span>
    </div>
  );
};

export default PasswordStrength;
