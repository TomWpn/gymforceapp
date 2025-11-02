// functions/src/index.ts
import { searchEmployersSecondGen } from "./functions/searchEmployersSecondGen";
import { setGlobalOptions } from "firebase-functions/v2";
import { getNearbyFacilitiesSecondGen } from "./functions/getNearbyFacilitiesSecondGen";
import { getCompanyByIdSecondGen } from "./functions/getCompanyByIdSecondGen";
import { onGymReviewCreated } from "./functions/onGymReviewCreated";
import { onGymReviewUpdated } from "./functions/onGymReviewUpdated";
import { createCompanySecondGen } from "./functions/createCompanySecondGen";
import { handleMembershipInterest } from "./functions/handleMembershipInterest";
import { claimMembershipHttp } from "./functions/claimMembershipHttp";
import { checkMembershipStatusHttp } from "./functions/checkMembershipStatusHttp";
import { verifyMembershipHttp } from "./functions/verifyMembershipHttp";
import { checkMembershipStatus } from "./functions/checkMembershipStatus";
import { handleContestCheckIn } from "./functions/handleContestCheckIn";
import { checkUserCheckInEligibility } from "./functions/checkUserCheckInEligibility";

// locate all functions closest to users
setGlobalOptions({ region: "us-central1" });
exports.searchEmployersSecondGen = searchEmployersSecondGen;
exports.getNearbyFacilitiesSecondGen = getNearbyFacilitiesSecondGen;
exports.getCompanyByIdSecondGen = getCompanyByIdSecondGen;
exports.onGymReviewCreated = onGymReviewCreated;
exports.onGymReviewUpdated = onGymReviewUpdated;
exports.createCompanySecondGen = createCompanySecondGen;
exports.handleMembershipInterest = handleMembershipInterest;
exports.claimMembershipHttp = claimMembershipHttp;
exports.checkMembershipStatusHttp = checkMembershipStatusHttp;
exports.verifyMembershipHttp = verifyMembershipHttp;
exports.checkMembershipStatus = checkMembershipStatus;
exports.handleContestCheckIn = handleContestCheckIn;
exports.checkUserCheckInEligibility = checkUserCheckInEligibility;
