import { Monitoring } from 'react-scan/monitoring/next';

interface ReactScanProps {
  apiKey: string;
}

const ReactScan = ({ apiKey }: ReactScanProps) => (
  <Monitoring apiKey={apiKey} url="https://monitoring.react-scan.com/api/v1/ingest" />
);

export default ReactScan;
