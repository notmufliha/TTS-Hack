"use client";

import React from "react";
import { useApiData } from "../../../components/useApiData";

export default function SwabsTable() {
  const { data, loading, error } = useApiData();
  const swabs = data?.swabs ?? [];
  const referralOrders = data?.referralOrders ?? [];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Create a mapping of patient_id to provider from the most recent referral orders
  const patientProviderMap = {};

  // Group referral orders by patient_id and get the most recent one for each patient
  const referralOrdersByPatient = {};

  referralOrders.forEach((order) => {
    if (order.patient_id && order.order_datetime) {
      const patientId = order.patient_id;
      const orderDateTime = new Date(order.order_datetime);

      // If we haven't seen this patient or this order is more recent, update it
      if (
        !referralOrdersByPatient[patientId] ||
        orderDateTime >
          new Date(referralOrdersByPatient[patientId].order_datetime)
      ) {
        referralOrdersByPatient[patientId] = order;
      }
    }
  });

  // Create the final mapping using only the most recent orders
  Object.entries(referralOrdersByPatient).forEach(([patientId, order]) => {
    patientProviderMap[patientId] = order.provider;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Swab Test Management
          </h1>
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">
                    Swab ID
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">
                    Swab Date
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">
                    Patient
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">
                    Swab Type
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {swabs.map((swab) => {
                  const provider = patientProviderMap[swab.patient_id] || "N/A";

                  return (
                    <tr key={swab.swab_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">
                        {swab.swab_id}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {swab.swab_date || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        <div className="text-xs text-gray-800">
                          <div className="font-semibold">
                            ID: {swab.patient_id}
                          </div>
                          <div>{swab.patient_name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-800">{provider}</td>
                      <td className="px-4 py-3 text-gray-800">
                        {swab.swab_type}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            swab.result === "negative"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {swab.result}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {swabs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">
                      No swabs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
