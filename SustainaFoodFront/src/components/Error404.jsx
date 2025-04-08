// components/Error404.jsx
import { Link } from 'react-router-dom';

const Error404 = () => {
  return (
    <div className="text-center p-8">
      <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
      <Link to="/" className="text-blue-500 hover:underline">
        Return to Home
      </Link>
    </div>
  );
};
export default Error404;