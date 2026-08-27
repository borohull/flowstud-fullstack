import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl font-bold mb-4">⚡ FlowStud</h1>
      <p className="text-xl mb-8 max-w-md">
        A gamified study planning platform. Organize assignments, track progress, and level up your academics.
      </p>
      <div className="flex gap-4">
        <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
        <Link to="/login" className="btn btn-outline btn-lg">Login</Link>
      </div>
    </div>
  );
}
