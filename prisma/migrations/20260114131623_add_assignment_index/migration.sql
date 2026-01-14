-- CreateIndex
CREATE INDEX "Bus_routeId_status_idx" ON "Bus"("routeId", "status");

-- CreateIndex
CREATE INDEX "BusAssignment_rideDate_session_bookedCount_idx" ON "BusAssignment"("rideDate", "session", "bookedCount");
