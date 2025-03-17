import { SizeCalculator } from "../src/calculators/SizeCalculator.js";
import { AccuracyCalculator } from "../src/calculators/AccuracyCalculator.js";
import { BootstrapCalcultor } from "../src/calculators/BootstrapCalculator.js";



// 📌 Start processing

const bc = new BootstrapCalcultor();
bc.processFiles("participant_data/large/", "large_results", 5000);
bc.processFiles("participant_data/small/", "small_results", 5000);

const sc = new SizeCalculator();
sc.calculationToSize("participant_data/large/", "large");
sc.calculationToSize("participant_data/small/", "small");

const ac = new AccuracyCalculator();
ac.calculationAccuracy();
