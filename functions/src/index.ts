// functions/src/index.ts
import { searchEmployersSecondGen } from "./functions/searchEmployersSecondGen";
import * as admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions/v2";
import { getNearbyFacilitiesSecondGen } from "./functions/getNearbyFacilitiesSecondGen";
import { getCompanyByIdSecondGen } from "./functions/getCompanyByIdSecondGen";

// locate all functions closest to users
setGlobalOptions({ region: "us-central1" });

admin.initializeApp();

exports.searchEmployersSecondGen = searchEmployersSecondGen;
exports.getNearbyFacilitiesSecondGen = getNearbyFacilitiesSecondGen;
exports.getCompanyByIdSecondGen = getCompanyByIdSecondGen;
