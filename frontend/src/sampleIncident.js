export const SAMPLE_INCIDENT_TEXT = `DEVIATION REPORT - DEV-2026-0147
Date of Occurrence: 2026-11-18
Reported by: Shift Supervisor, API Production Block B
Department: Production (Drying & Milling)
Product: Metformin Hydrochloride API
Batch No.: MFH-B2611-042 (Batch size: 450 kg)

INCIDENT DESCRIPTION:
During routine in-process testing after Fluid Bed Dryer (FBD-02) drying, the Loss on Drying (LOD)
result for batch MFH-B2611-042 was 1.45% w/w against the specification limit of NMT 0.50% w/w.
The batch was dried for the standard 6 hours at an inlet air temperature set point of 75 °C.

OBSERVATIONS:
- The FBD-02 inlet temperature chart shows readings between 74-76 °C, but a handheld reference
  thermometer used by the operator at the end of the cycle read 63 °C at the inlet duct.
- The last calibration of the FBD-02 inlet RTD sensor was done 14 months ago; the calibration
  frequency per SOP-ENG-021 is 12 months. The calibration sticker was found faded.
- Ambient relative humidity in the drying suite was recorded at 68% RH (limit: NMT 60% RH) on the
  day of the incident due to a dehumidifier (AHU-7) trip that was reported but not yet repaired.
- The operator on shift had joined the department 3 weeks earlier; training record for SOP-PRD-114
  (FBD operation) shows "on-the-job training in progress".
- Two previous batches (MFH-B2610-038 and MFH-B2611-040) showed LOD values of 0.46% and 0.48%,
  close to the upper limit.
- The wet cake from the centrifuge (CF-01) for this batch was held for 9 hours before drying
  (normal hold: 2-4 hours) because FBD-02 was busy.

IMMEDIATE ACTIONS TAKEN:
- Batch placed on QA HOLD. Re-drying is NOT permitted without QA approval.
- FBD-02 tagged "Under Investigation".

Please perform a root cause investigation and propose CAPA.`
