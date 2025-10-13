export interface ComponentData {
  demosPath: string;
  group: string;
  name: string;
  readme: string;
  title: string;
}

export interface PlaygroundData {
  components: Record<string, ComponentData>;
  groups: string[];
}
