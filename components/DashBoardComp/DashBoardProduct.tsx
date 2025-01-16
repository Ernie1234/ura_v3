import React from "react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "../ui/button";
import PhotoCard from "./PhotoCard";
import { relativeDateFn } from "@/lib/fn";
import EllipseMenu from "./EllipseMenu";

export interface IBusiness {
  id: string;
  name: string;
  userId: string;
  address: string | null;
  phone: string | null;
  hours: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  products: {
    imageUrl: string;
    id: string;
    price: number;
    name: string;
    description: string;
    businessId: string;
    userId: string;
  }[];
}

export interface DashBoardProductProps {
  business: IBusiness[] | { error: string };
}

const DashBoardProduct = ({ business }: DashBoardProductProps) => {
  // console.log("dashboard business listing", business);
  if ("error" in business) {
    return <div>Error: {business.error}</div>;
  }

  if (business.length === 0) {
    return (
      <div className="flex justify-center items-center text-center text-lg">
        No businesses found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 bg-white p-4 border rounded-lg">
      {business.map((business) => (
        <div key={business.id} className="space-y-3 w-full">
          <div className="flex justify-between">
            <div className="flex gap-3">
              <Image
                src={business.imageUrl || ""}
                alt={business.name}
                className="rounded-full w-12 h-12 object-cover"
                width={500}
                height={500}
              />
              <div className="flex flex-col gap-2">
                <h4 className="font-semibold leading-none">{business.name}</h4>
                <p className="text-slate-500">
                  {relativeDateFn(business.createdAt)}
                </p>
              </div>
            </div>
            <EllipseMenu bookmarkId={business.id} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="leading-none">New collection alert</p>
            <p className="leading-none">We await your patronage.</p>
          </div>
          <div className="gap-3 grid grid-cols-2 lg:grid-cols-3 w-full">
            {business.products.slice(0, 4).map((prod) => (
              <PhotoCard
                key={prod.id}
                price={prod.price}
                id={prod.id}
                src={prod.imageUrl}
                title={prod.name}
              />
            ))}
          </div>
          <Button className="w-full" asChild variant="uraOrange">
            <Link href={`/dashboard/business/${business.id}`}>
              View Profile
            </Link>
          </Button>
        </div>
      ))}
    </div>
  );
};

export default DashBoardProduct;
