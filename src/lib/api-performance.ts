import { NextRequest, NextResponse } from 'next/server';

type ApiHandler<T = any> = (
  req: NextRequest,
  ...args: any[]
) => Promise<Response | NextResponse<T>> | Response | NextResponse<T>;

export function withPerformanceMonitoring<T>(
  handler: ApiHandler<T>
): (req: NextRequest, ...args: any[]) => Promise<Response | NextResponse<T>> {
  return async (req: NextRequest, ...args: any[]) => {
    const start = Date.now();
    let response: Response | NextResponse<T> | undefined;
    
    try {
      // Call the handler with the request and any additional arguments
      const result = await handler(req, ...args);
      
      // If the handler returns a Response or NextResponse, store it to add timing headers
      if (result instanceof Response || 
          (typeof NextResponse !== 'undefined' && 
           result && 
           'redirect' in result && 
           'json' in result)) {
        response = result as Response | NextResponse<T>;
      }
      
      return result;
    } catch (error) {
      console.error(`[API Error] ${req.method} ${req.url}`, error);
      throw error;
    } finally {
      const duration = Date.now() - start;
      const url = new URL(req.url);
      console.log(`[API] ${req.method} ${url.pathname} - ${duration}ms`);
      
      // Add server-timing header if we have a response object
      if (response) {
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Server-Timing', `total;dur=${duration}`);
        
        // Create a new response with the updated headers
        const responseInit: ResponseInit = {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        };
        
        // Handle different response types
        if (typeof NextResponse !== 'undefined' && 
            response && 
            'redirect' in response && 
            'json' in response) {
          return new NextResponse(response.body, {
            ...response,
            ...responseInit,
          });
        }
        
        return new Response(response.body, responseInit);
      }
    }
  };
}
