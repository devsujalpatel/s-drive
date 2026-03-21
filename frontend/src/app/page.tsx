import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-start min-h-screen">
      <nav className="flex items-center justify-between w-full mb-8 p-8">
        <h1 className="text-2xl font-bold">S-Drive</h1>
        <div>
          <Link href="/register" className="ml-4 cursor-pointer">
            <Button className="cursor-pointer">Register</Button>
          </Link>
          <Link href="/login" className="ml-4 cursor-pointer">
            <Button variant={"link"} className="cursor-pointer">
              Login
            </Button>
          </Link>
        </div>
      </nav>
      <div className="flex flex-col items-center px-8 justify-center w-full mt-40">
        <h2 className="text-4xl font-bold mb-4">Welcome to S-Drive</h2>
        <p className="text-lg text-muted-foreground">
          Your secure and private cloud storage solution.
        </p>
        <Link href="/directory" className="mt-6 inline-block">
          <Button className="cursor-pointer">Your Folder</Button>
        </Link>
      </div>
    </div>
  );
}
