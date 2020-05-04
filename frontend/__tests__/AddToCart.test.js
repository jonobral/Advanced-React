import { mount } from 'enzyme';
import wait from 'waait';
import toJSON from 'enzyme-to-json';
import { MockedProvider } from 'react-apollo/test-utils';
import { ApolloConsumer } from 'react-apollo';
import AddToCart, { ADD_TO_CART_MUTATION } from '../components/AddToCart';
import { CURRENT_USER_QUERY } from '../components/User';
import { fakeUser, fakeCartItem } from '../lib/testUtils';

const queryMock = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [],
        },
      },
    },
  }
];

const actionMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [fakeCartItem()],
        },
      },
    },
  },
  {
    request: { query: ADD_TO_CART_MUTATION, variables: { id: 'abc123' } },
    result: {
      data: {
        addToCart: {
          ...fakeCartItem(),
          quantity: 1,
        },
      },
    },
  },
];

describe('<AddToCart/>', () => {
  it('renders and matches the snap shot', async () => {
    const wrapper = mount(
      <MockedProvider mocks={queryMock}>
        <AddToCart id="abc123" />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(toJSON(wrapper.find('button'))).toMatchSnapshot();
  });

  it('adds an item to cart when clicked', async () => {

    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={actionMocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client;
            return <AddToCart id="abc123" />;
          }}
        </ApolloConsumer>
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    // add an item to the cart
    wrapper.find('button').simulate('click');
    await wait();
    // check if the item is in the cart
    const response = await apolloClient.query({ query: CURRENT_USER_QUERY });
    const payload = response.data.me;
    expect(payload.cart).toHaveLength(1);
    expect(payload.cart[0].id).toBe('omg123');
    expect(payload.cart[0].quantity).toBe(3);
  });

  it('changes from add to adding when clicked', async () => {
    const wrapper = mount(
      <MockedProvider mocks={actionMocks}>
        <AddToCart id="abc123" />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.text()).toContain('Add To Cart');
    wrapper.find('button').simulate('click');
    expect(wrapper.text()).toContain('Adding To Cart');
  });
});