import React from 'react';

const AdminFoodTab = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Food</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Food Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Pizza</td>
              <td>Italian</td>
              <td>$10</td>
              <td>
                <button className="btn btn-sm btn-primary mr-2">Edit</button>
                <button className="btn btn-sm btn-error mr-2">Delete</button>
                <button className="btn btn-sm btn-info">View Details</button>
              </td>
            </tr>
            <tr>
              <td>Burger</td>
              <td>American</td>
              <td>$8</td>
              <td>
                <button className="btn btn-sm btn-primary mr-2">Edit</button>
                <button className="btn btn-sm btn-error mr-2">Delete</button>
                <button className="btn btn-sm btn-info">View Details</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFoodTab;