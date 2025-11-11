export default function ContentSection({ title, items, className = "" }) {
  // Handle both string and array formats
  const content = typeof items === 'string' ? items : (Array.isArray(items) ? items.join('\n') : '');
  
  // Split content by newlines and number them if they look like list items
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  
  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-6 shadow-md ${className}`}>
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      
      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        <div className="space-y-3">
          {lines.map((line, index) => {
            // Check if line starts with a number (like "1. " or "1.")
            const isNumbered = /^\d+\.\s/.test(line.trim());
            const cleanLine = line.trim().replace(/^\d+\.\s*/, '');
            
            return (
              <div key={index} className="flex items-start space-x-2">
                {isNumbered && (
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                    {line.trim().match(/^\d+\./)?.[0].replace('.', '')}
                  </span>
                )}
                <p className={`text-slate-700 leading-relaxed ${isNumbered ? '' : 'pl-0'}`}>
                  {cleanLine || line}
                </p>
              </div>
            );
          })}
          {lines.length === 0 && (
            <p className="text-slate-500 italic">No content available</p>
          )}
        </div>
      </div>
    </div>
  );
}
// http://localhost:5173/interview/report/
