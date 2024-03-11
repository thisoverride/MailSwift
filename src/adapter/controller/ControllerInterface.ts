/**
 * Represents the Controller Implementation interface.
 */
export interface ControllerImpl {
  /**
   * Represents the route strings.
   */
  ROUTE: string[];
}

/**
 * Represents the HTTP Response structure.
 */
export interface HttpResponse {
  /**
   * The message content of the HTTP response.
   */
  message: string;

  /**
   * The status code of the HTTP response.
   */
  status: number;
}
