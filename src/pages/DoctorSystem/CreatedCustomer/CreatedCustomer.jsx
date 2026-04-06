import CustomerAndPets, { CustomerAndPetsForm } from '../CreateCustomerAndPets/CustomerAndPets';

export function CreatedCustomerForm(props) {
	return <CustomerAndPetsForm {...props} />;
}

export default function CreatedCustomer() {
	return <CustomerAndPets />;
}
