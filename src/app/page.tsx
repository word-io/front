import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="max-w-xl mx-auto p-6 sm:p-8 md:p-10">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Join a Game</h1>
          <p className="text-muted-foreground">
            Choose from available rooms or create a new one.
          </p>
        </div>
        <div className="grid gap-6">
          <div className="bg-muted rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Available Rooms</h2>
            <div className="grid gap-4">
              <div className="bg-card rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Room 1</h3>
                  <p className="text-muted-foreground">2/4 players</p>
                </div>
                <Button variant="outline">Join</Button>
              </div>
              <div className="bg-card rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Room 2</h3>
                  <p className="text-muted-foreground">1/4 players</p>
                </div>
                <Button variant="outline">Join</Button>
              </div>
              <div className="bg-card rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Room 3</h3>
                  <p className="text-muted-foreground">4/4 players</p>
                </div>
                <Button variant="outline" disabled>
                  Full
                </Button>
              </div>
            </div>
          </div>
          <Button className="w-full">Create New Room</Button>
        </div>
      </div>
    </div>
  );
}
