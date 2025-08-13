export default function TestPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🎉 Test Page Works!</h1>
      <p>If you can see this, the Vercel deployment is working.</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  );
}