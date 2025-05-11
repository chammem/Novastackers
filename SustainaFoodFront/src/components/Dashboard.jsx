import { useState, useEffect } from 'react';
import { PieChart, BarChart } from './ChartComponents';
import { LoadingSpinner } from './LoadingSpinner';
import { 
    UsersIcon, 
    DonationIcon, 
    RestaurantIcon, 
    SupermarketIcon, 
    DriverIcon
} from './Icons';
import axiosInstance from "../config/axiosInstance";

// Ajout d'une alerte d'erreur simple et accessible
const ErrorAlert = ({ message, retry }) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] bg-red-50 border border-red-200 rounded-xl p-6">
    <span className="text-red-600 font-semibold mb-2">Error: {message}</span>
    {retry && (
      <button
        onClick={retry}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Retry
      </button>
    )}
  </div>
);

const Dashboard = ({ sidebarOpen }) => {
  const [stats, setStats] = useState({
    users: [],
    restaurants: [],
    supermarkets: [],
    drivers: [],
    donations: [],
    loading: true,
    error: null
  });

  const prepareMonthlyData = (donations) => {
    const monthlyCounts = donations.reduce((acc, donation) => {
      const month = new Date(donation.createdAt).getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'January', value: monthlyCounts[0] || 0 },
      { name: 'February', value: monthlyCounts[1] || 0 },
      { name: 'March', value: monthlyCounts[2] || 0 },
      { name: 'April', value: monthlyCounts[3] || 0 },
      { name: 'May', value: monthlyCounts[4] || 0 },
      { name: 'June', value: monthlyCounts[5] || 0 },
      { name: 'July', value: monthlyCounts[6] || 0 },
      { name: 'August', value: monthlyCounts[7] || 0 },
      { name: 'September', value: monthlyCounts[8] || 0 },
      { name: 'October', value: monthlyCounts[9] || 0 },
      { name: 'November', value: monthlyCounts[10] || 0 },
      { name: 'December', value: monthlyCounts[11] || 0 }
    ];
  };

  // Pour le retry dans ErrorAlert
  const fetchDashboardData = async () => {
    try {
      const endpoints = [
        { url: '/users-by-role', key: 'users' },
        { url: '/users-by-role?role=restaurant', key: 'restaurants' },
        { url: '/users-by-role?role=supermarket', key: 'supermarkets' },
        { url: '/users-by-role?role=driver', key: 'drivers' },
        { url: '/donations/get-all-donations', key: 'donations' }
      ];

      const responses = await Promise.all(
        endpoints.map(endpoint => axiosInstance.get(endpoint.url))
      );

      setStats({
        users: responses[0].data,
        restaurants: responses[1].data,
        supermarkets: responses[2].data,
        drivers: responses[3].data,
        donations: responses[4].data,
        loading: false,
        error: null
      });
    } catch (err) {
      setStats(prev => ({
        ...prev,
        error: err.response?.data?.message || err.message,
        loading: false
      }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (stats.loading) return <LoadingSpinner fullScreen />;
  if (stats.error) return <ErrorAlert message={stats.error} retry={fetchDashboardData} />;

  return (
    <div
      className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'} pt-8 pb-8 px-2 md:px-8 `}
      style={{ minHeight: "" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header créatif et simple */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-green-700 mb-1">
              Welcome to your Dashboard
            </h1>
            <p className="text-gray-500 text-base md:text-lg">
              Visualize your platform’s activity and key metrics in real time.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold shadow">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Ajout d'un indicateur de performance rapide pour l'admin */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[180px] bg-gradient-to-r from-green-100 to-green-50 rounded-xl p-4 flex items-center shadow hover:shadow-green-200 transition">
            <span className="text-green-600 font-bold text-2xl mr-3">
              {stats.donations.filter(d => d.status === "pending").length}
            </span>
            <span className="text-gray-700">Pending Donations</span>
          </div>
          <div className="flex-1 min-w-[180px] bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl p-4 flex items-center shadow hover:shadow-blue-200 transition">
            <span className="text-blue-600 font-bold text-2xl mr-3">
              {stats.users.filter(u => u.status === "inactive").length}
            </span>
            <span className="text-gray-700">Inactive Users</span>
          </div>
        </div>

        {/* Statistiques sous forme de cartes modernes */}
        <StatCards stats={stats} />

        {/* Graphiques avec effet carte */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartContainer title="User Distribution">
            <PieChart 
              data={[
                { name: 'Admin', value: stats.users.filter(u => u.role === 'admin').length },
                { name: 'NGO', value: stats.users.filter(u => u.role === 'ngo').length },
                { name: 'Restaurants', value: stats.restaurants.length },
                { name: 'Supermarkets', value: stats.supermarkets.length },
                { name: 'Drivers', value: stats.drivers.length }
              ]}
              colors={['#3B82F6', '#10B981', '#8B5CF6', '#F97316', '#EC4899']}
            />
          </ChartContainer>

          <ChartContainer title="Donations by Month">
            <BarChart 
              data={prepareMonthlyData(stats.donations)} 
              color="#3B82F6"
            />
          </ChartContainer>
        </div>

        {/* Activité récente */}
        <ActivityFeed donations={stats.donations.slice(0, 5)} />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-base-100 dark:bg-base-200 p-6 rounded-2xl shadow-lg flex items-center hover:scale-[1.03] transition-transform duration-200 border border-base-200">
    <div className={`p-3 rounded-full ${color} mr-4 shadow-inner`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const StatCards = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
    <StatCard 
      title="Users" 
      value={stats.users.length}
      icon={<UsersIcon className="h-6 w-6" />}
      color="bg-blue-100 text-blue-600"
    />
    <StatCard 
      title="Restaurants" 
      value={stats.restaurants.length}
      icon={<RestaurantIcon className="h-6 w-6" />}
      color="bg-purple-100 text-purple-600"
    />
    <StatCard 
      title="Supermarkets" 
      value={stats.supermarkets.length}
      icon={<SupermarketIcon className="h-6 w-6" />}
      color="bg-green-100 text-green-600"
    />
    <StatCard 
      title="Drivers" 
      value={stats.drivers.length}
      icon={<DriverIcon className="h-6 w-6" />}
      color="bg-orange-100 text-orange-600"
    />
    <StatCard 
      title="Donations" 
      value={stats.donations.length}
      icon={<DonationIcon className="h-6 w-6" />}
      color="bg-red-100 text-red-600"
    />
  </div>
);

const ChartContainer = ({ title, children, className = '', ...props }) => (
  <div 
    className={`bg-base-100 dark:bg-base-200 p-6 rounded-2xl shadow-lg hover:shadow-green-100 transition-shadow duration-300 ${className}`}
    {...props}
  >
    {title && <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>}
    <div className="w-full h-full min-h-[300px]">
      {children}
    </div>
  </div>
);

const ActivityFeed = ({ donations = [] }) => (
  <div className="bg-base-100 dark:bg-base-200 p-6 rounded-2xl shadow-lg">
    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
    <div className="space-y-4">
      {donations.length === 0 && (
        <div className="text-gray-400 text-center py-8">No recent donations.</div>
      )}
      {donations.map(donation => (
        <div key={donation._id} className="flex items-start pb-4 border-b border-gray-100 last:border-0">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <SupermarketIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">
              New collection: <span className="text-blue-600">{donation.name || 'Unnamed donation'}</span>
            </p>
            <p className="text-sm text-gray-500">
              {donation.foods?.length || 0} items • 
              Location: {donation.location || 'Not specified'} • 
              {new Date(donation.createdAt).toLocaleDateString()}
            </p>
            {donation.volunteers?.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {donation.volunteers.length} volunteer(s) participating
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Dashboard;