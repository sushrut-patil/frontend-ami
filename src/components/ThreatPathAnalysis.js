import { useState, useEffect } from 'react';
import axios from 'axios';
import * as d3 from 'd3';

const ThreatPathAnalysis = () => {
  const [threatData, setThreatData] = useState({ nodes: [], edges: [], paths: [] });
  const [selectedPath, setSelectedPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from Django backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/threat-data/');
        setThreatData(response.data);
        // Optionally select the first path by default
        if (response.data.paths && response.data.paths.length > 0) {
          setSelectedPath(response.data.paths[0].id);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching threat data:', err);
        setError('Failed to load threat data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // D3 visualization effect
  useEffect(() => {
    if (loading || !threatData.nodes.length || !document.getElementById('graph-container')) return;
    
    // Clear any existing SVG
    d3.select("#graph-container").selectAll("*").remove();
    
    // Set up the SVG
    const width = 1000;
    const height = 600;
    const svg = d3.select("#graph-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);
    
    // Create a simulation
    const simulation = d3.forceSimulation(threatData.nodes)
      .force("link", d3.forceLink(threatData.edges).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(80));
    
    // Define node colors
    const nodeColor = d => {
      if (d.type === "action") {
        if (d.suspiciousLevel === "high") return "#ef4444";
        if (d.suspiciousLevel === "medium") return "#f59e0b";
        return "#3b82f6";
      }
      if (d.type === "resource") return "#10b981";
      if (d.type === "system") return "#8b5cf6";
      return "#6b7280";
    };
    
    // Create the links
    const link = svg.append("g")
      .selectAll("path")
      .data(threatData.edges)
      .join("path")
      .attr("id", d => `link-${d.id}`)
      .attr("stroke", d => selectedPath && d.pathId === selectedPath ? "#f43f5e" : "#64748b")
      .attr("stroke-width", d => selectedPath && d.pathId === selectedPath ? 3 : 1.5)
      .attr("fill", "none");
    
    // Create link labels
    const linkLabel = svg.append("g")
      .selectAll("text")
      .data(threatData.edges)
      .join("text")
      .append("textPath")
      .attr("href", d => `#link-${d.id}`)
      .attr("startOffset", "50%")
      .attr("text-anchor", "middle")
      .attr("fill", "#d1d5db")
      .attr("font-size", "12px")
      .text(d => d.label);
    
    // Create the nodes
    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(threatData.nodes)
      .join("g")
      .attr("class", "node-group")
      .on("click", (event, d) => {
        const nodeId = d.id;
        // Find paths that include this node
        const associatedPaths = threatData.edges
          .filter(edge => edge.source.id === nodeId || edge.target.id === nodeId)
          .map(edge => edge.pathId)
          .filter(pathId => pathId !== null);
        
        if (associatedPaths.length > 0) {
          setSelectedPath(associatedPaths[0]);
        }
      });
    
    // Add circles to nodes
    nodeGroup.append("circle")
      .attr("r", d => d.type === "action" ? 40 : 30)
      .attr("fill", nodeColor)
      .attr("stroke", "#1e293b")
      .attr("stroke-width", 2);
    
    // Add labels to nodes
    nodeGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", d => d.type === "action" ? "0em" : "0.3em")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("font-size", "12px")
      .text(d => {
        const words = d.label.split(' ');
        return words.length > 2 ? `${words[0]} ${words[1]}...` : d.label;
      });
    
    // Add type indicator for action nodes
    nodeGroup.filter(d => d.type === "action")
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.2em")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .text(d => d.status);
    
    // Update positions on each simulation tick
    simulation.on("tick", () => {
      link.attr("d", d => {
        // Create a curved path if nodes are close
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        const curvature = 1.5;
        
        return `M${d.source.x},${d.source.y}A${dr * curvature},${dr * curvature} 0 0,1 ${d.target.x},${d.target.y}`;
      });
      
      nodeGroup.attr("transform", d => `translate(${d.x},${d.y})`);
    });
    
    // Drag behavior
    nodeGroup.call(d3.drag()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }));
      
  }, [loading, threatData, selectedPath]);

  // Get the currently selected path data
  const currentPath = threatData.paths.find(path => path.id === selectedPath);

  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-900 text-white p-6 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading threat path data...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gray-900 text-white p-6 min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Threat Path Analysis</h1>
        <p className="text-gray-400 mb-6">Visualization of potential data breach pathways based on activity logs</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Path selection and details panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-semibold mb-3">Breach Pathways</h2>
              <div className="space-y-2">
                {threatData.paths.map(path => (
                  <button
                    key={path.id}
                    onClick={() => setSelectedPath(path.id)}
                    className={`w-full text-left p-3 rounded-md transition-colors ${
                      selectedPath === path.id 
                        ? 'bg-blue-900 text-blue-100' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{path.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        path.severity >= 8 ? 'bg-red-900 text-red-200' :
                        path.severity >= 6 ? 'bg-yellow-900 text-yellow-200' :
                        'bg-blue-900 text-blue-200'
                      }`}>
                        Severity: {path.severity}/10
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {currentPath && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-3">{currentPath.name}</h2>
                <p className="text-gray-300 mb-4">{currentPath.description}</p>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Entry Point</h3>
                  <p className="bg-gray-700 p-2 rounded">
                    {threatData.nodes.find(n => n.id === currentPath.entryPoint)?.label}
                  </p>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Critical Resources</h3>
                  <ul className="list-disc list-inside bg-gray-700 p-2 rounded">
                    {currentPath.criticalResources.map((resource, i) => (
                      <li key={i} className="text-gray-200">{resource}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Risk Factors</h3>
                  <ul className="list-disc list-inside bg-gray-700 p-2 rounded">
                    {currentPath.riskFactors.map((factor, i) => (
                      <li key={i} className="text-gray-200">{factor}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Recommendation</h3>
                  <p className="bg-gray-700 p-2 rounded text-gray-200">{currentPath.recommendation}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Graph visualization */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg overflow-hidden">
            <div id="graph-container" className="w-full h-96 lg:h-full min-h-[600px]"></div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-3">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm">High Risk Action</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-sm">Medium Risk Action</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm">Low Risk Action</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm">Resource</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
              <span className="text-sm">System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatPathAnalysis;