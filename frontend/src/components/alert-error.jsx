import { Alert, AlertTitle } from "@/components/ui/alert";

export const title = "Error with Title";

const AlertError = () => (
  <Alert className="w-full max-w-lg border-destructive/80 bg-destructive/5 text-destructive">
    <AlertTitle>Error</AlertTitle>
  </Alert>
);

export default AlertError;
