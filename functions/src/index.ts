// functions/src/index.ts
import { searchEmployersSecondGen } from "./functions/searchEmployersSecondGen";
import { setGlobalOptions } from "firebase-functions/v2";
import { getNearbyFacilitiesSecondGen } from "./functions/getNearbyFacilitiesSecondGen";
import { getCompanyByIdSecondGen } from "./functions/getCompanyByIdSecondGen";
import { onGymReviewCreated } from "./functions/onGymReviewCreated";
import { onGymReviewUpdated } from "./functions/onGymReviewUpdated";

// locate all functions closest to users
setGlobalOptions({ region: "us-central1" });
exports.searchEmployersSecondGen = searchEmployersSecondGen;
exports.getNearbyFacilitiesSecondGen = getNearbyFacilitiesSecondGen;
exports.getCompanyByIdSecondGen = getCompanyByIdSecondGen;
exports.onGymReviewCreated = onGymReviewCreated;
exports.onGymReviewUpdated = onGymReviewUpdated;
