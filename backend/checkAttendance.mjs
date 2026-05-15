import mongoose from "mongoose";

await mongoose.connect("mongodb://localhost:27017/academic_integrity");
const att = mongoose.connection.collection("attendances");

// Delete old records that have no subject (they were from before subject support)
const result = await att.deleteMany({
  $or: [{ subject: { $exists: false } }, { subject: null }]
});

console.log(`Deleted ${result.deletedCount} old attendance records without subject field.`);

// Also check what subjects we have
const subjectsCol = mongoose.connection.collection("subjects");
const subjects = await subjectsCol.find({}).toArray();
console.log("\nSubjects in DB:");
subjects.forEach(s => console.log(`  ${s.name} (${s.code}) -> ${s._id}`));

// Check remaining attendance records
const remaining = await att.find({}).toArray();
console.log(`\nRemaining attendance records: ${remaining.length}`);
remaining.forEach(r => console.log(`  student:${r.student}, subject:${r.subject}, date:${r.date}, status:${r.status}`));

// Check PerformanceRecord student field
const pr = mongoose.connection.collection("performancerecords");
const prSample = await pr.find({ student: { $exists: true } }).limit(2).toArray();
console.log("\nPerformanceRecord sample:", JSON.stringify(prSample.map(r => ({
  studentId: r.studentId, student: r.student, subject: r.subject
})), null, 2));

process.exit(0);
