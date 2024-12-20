import { MonitoringInner as Monitoring } from 'react-scan/monitoring/next';

interface ReactScanProps {
  apiKey: string;
}

const ReactScan = ({ apiKey }: ReactScanProps) => (
  <Monitoring
    apiKey={apiKey}
    branch={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF}
    commit={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}
    url="https://monitoring.react-scan.com/api/v1/ingest"
  />
);

export default ReactScan;
