import { currentUser } from "@clerk/nextjs/server";

import { Separator } from "@/components/ui/separator";

import TopNav from "@/components/nav/TopNav";
import { getBusinessById } from "@/actions/businessAction";
import BusinessHeader from "@/components/header/BusinessHeader";
import { TBusinessResponse } from "@/types/types";
import HomeHeader from "@/components/header/HomeHeader";
import PhotoCard from "@/components/DashBoardComp/PhotoCard";
import RateBusiness from "@/components/RateBusiness";
import { getStarRepresentation } from "@/components/shared/getStarRating";
import { calculateAverageRating } from "@/lib/fn";
import LeaveAReview from "@/components/review/LeaveAReview";
import ReviewListing from "@/components/review/ReviewListing";
import Map from "@/components/shared/Map";

export default async function page({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const businessId = (await params).businessId;
  const business = (await getBusinessById(businessId)) as TBusinessResponse;

  if ("error" in business) {
    return <div>Error: {business.error}</div>;
  }

  const user = await currentUser();
  const currentUserName = `${user?.firstName} ${user?.lastName || ""}`;

  const showRating = user?.id !== business?.userId;

  const averageRating = calculateAverageRating(business.ratings);

  const reviews = Array.isArray(business.reviews) ? business.reviews : [];

  const location = {
    lat: business.location?.lat || 9,
    lng: business.location?.lng || 9,
  };

  console.log(business);

  return (
    <div className="space-y-2 bg-slate-100 w-full h-full overflow-y-auto no-scrollbar">
      <TopNav />
      <div className="flex flex-col gap-3 w-full">
        <BusinessHeader business={business} />
        <HomeHeader />
        <div className="flex flex-col gap-2 bg-white p-4 border rounded-lg">
          <h2 className="-mt-1 font-bold font-primary text-xl leading-none">
            About {business?.name || "Us"}
          </h2>
          <Separator />
          <p className="font-medium text-gray-600 text-lg">
            {business?.description}
          </p>
        </div>
        <div className="flex flex-col gap-2 bg-white p-4 border rounded-lg">
          <h2 className="-mt-1 font-bold font-primary text-xl leading-none">
            Products
          </h2>
          <Separator />
          <div className="gap-3 grid grid-cols-2 lg:grid-cols-3 w-full">
            {business.products.map((prod) => (
              <PhotoCard
                key={prod.id}
                price={prod.price}
                id={prod.id}
                src={prod.imageUrl}
                title={prod.name}
              />
            ))}
          </div>
        </div>
        {showRating && (
          <div className="flex justify-between items-center gap-5">
            <div className="flex items-center gap-2 font-medium text-sm">
              <span className="flex">
                {getStarRepresentation(averageRating)}
              </span>
              <span>{averageRating || 0} ratings</span>
            </div>
            <RateBusiness businessId={businessId} />
          </div>
        )}

        <LeaveAReview
          businessId={businessId}
          senderImg={user?.imageUrl}
          senderName={currentUserName}
        />
        <ReviewListing reviews={reviews} />
        <Separator />
        <div className="flex gap-2">
          <p className="">Business Information</p>
        </div>
        <Map location={location} />
      </div>
    </div>
  );
}
