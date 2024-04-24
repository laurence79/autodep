import Container from './Container';
import InternalContainer from './InternalContainer';

const createContainer = (): Container => {
  return new InternalContainer();
};

export default createContainer;
