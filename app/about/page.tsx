'use client';
export default function AboutPage() {
  return (
    <div>
      <h2>About</h2>
      <p><strong>Name:</strong> Faris Khalil</p>
      <p><strong>Student Number:</strong> S22216628</p>
      <p>This Video demonstrates how to generate tabbed content for Moodle.</p>
      <video controls style={{ width: '100%' }}>
        <source src="/video/demo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}