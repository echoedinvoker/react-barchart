import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import D3 from "./D3";
import D3js from "./D3js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 60 * 1000
      staleTime: 0
    }
  }
})

function App() {
  return <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
      <D3 />
  </QueryClientProvider>
}

export default App

