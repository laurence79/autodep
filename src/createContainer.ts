import type Container from './Container';
import InternalContainer from './InternalContainer';

/**
 * Creates a new root container
 * @returns A new container
 */
const createContainer = (): Container => {
  return new InternalContainer();
};

export default createContainer;
