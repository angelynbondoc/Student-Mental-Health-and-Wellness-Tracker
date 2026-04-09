import { useState, useEffect } from "react";
import ResourceCard from "../components/ResourceCard";
import { MOCK_RESOURCES } from "../mockData";

// SECI — COMBINATION: Curated coping knowledge aggregated in one place.
function ResourcesPage() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    setResources(MOCK_RESOURCES);
  }, []);

  return (
    <div>
      <h2>💡 Coping Resources</h2>
      <p style={{ color: "#888", fontSize: "13px" }}>
        Evidence-based strategies to help you through tough moments.
      </p>
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  );
}

export default ResourcesPage;