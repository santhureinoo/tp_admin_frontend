import type { NextPage } from 'next';
import Table from '../components/Table';
import React from 'react';
import CustomerEdit from '../components/CustomerEdit';
import ClientOnly from '../components/ClientOnly';
import { customer } from '../types/datatype';
import { gql, useMutation, useQuery } from '@apollo/client';
import { calculatePagination } from '../common/helper';

const Customers: NextPage = () => {
  return (
    <React.Fragment>
      <ClientOnly>
        <CustomerTable></CustomerTable>
      </ClientOnly>
    </React.Fragment >
  )
}

Customers.getInitialProps = async () => {
  const title = 'Customer';
  return { title };
};

const CustomerTable: any = () => {
  const [customers, setCustomers] = React.useState<customer[]>([]);
  const [openCustomerEdit, setOpenCustomerEdit] = React.useState(false);
  const [totalPage, setTotalpage] = React.useState(0);
  const [currentPageIndex, setCurrentPageIndex] = React.useState(1);
  const [selectedCustomer, setSelectedCustomer] = React.useState<customer>();

  const getTotalQuery = gql`
  query _count {
    aggregateCustomer {
      _count {
        _all
      }
    }
  }`;

  const getCustomersQuery = gql`
  query Customers($take: Int, $skip: Int) {
    customers(take: $take, skip: $skip)  {
      customer_id
      name
      pte_ltd_name
      pic_name
      pic_phone
      country
      city
      current_address
      postal_code
      outlet {
        _count {
          results
        }
      }
    }
  }`;

  const getCustomersVariable = {
    "variables": {
      "take": 5,
      "skip": (currentPageIndex * 5) - 5
    },
  };

  const mutate_delete_customer_query = gql`
    mutation DeleteOneCustomer($where: CustomerWhereUniqueInput!) {
        deleteOneCustomer(where: $where) {
          customer_id
        }
      }`;

  const { loading, error, data, refetch } = useQuery(getCustomersQuery, getCustomersVariable);
  const getTotalResult = useQuery(getTotalQuery);
  const [deleteMutationQuery, deleteMutationResult = { data, loading, error }] = useMutation(mutate_delete_customer_query);

  React.useEffect(() => {
    if (data && data.customers) {
      setCustomers(data.customers);
    }
  }, [data]);

  React.useEffect(() => {
    if (getTotalResult.data && getTotalResult.data.aggregateCustomer) {
      setTotalpage(calculatePagination(getTotalResult.data.aggregateCustomer._count._all));
    } else {
      setTotalpage(0);
    }
  }, [getTotalResult.data]);

  React.useEffect(() => {
    getTotalResult.refetch();
    refetch();
  }, [currentPageIndex]);

  const resultInArray = React.useMemo(() => {
    return customers ? customers.map((cur) => [cur.customer_id, cur.name, cur.pic_name, cur.pic_phone, 0, 0]) : [];
  }, [customers]);


  return (
    <React.Fragment>
      <Table headers={['ID', 'Name', 'PIC Name', 'PIC Phone', 'Outlets', 'Equipment']} data={resultInArray} handleAddNew={() => { setSelectedCustomer(undefined); setOpenCustomerEdit(true) }} handleEdit={(selectedData) => { setOpenCustomerEdit(true); setSelectedCustomer(customers.find(customer => customer.customer_id === selectedData[0])) }} handleDelete={(selectedData) => {
        deleteMutationQuery({
          variables: {
            "where": {
              "customer_id": selectedData[0]
            },
          }
        }).then((value) => {
          refetch();
          getTotalResult.refetch();
        })
      }} rightSideElements={[]} leftSideElements={[]} buttonText={'+ Add New Customer'} totalNumberOfPages={totalPage} setCurrentSelectedPage={setCurrentPageIndex} currentSelectedPage={currentPageIndex} />
      <CustomerEdit afterOperation={() => { refetch(); getTotalResult.refetch(); }} customer={selectedCustomer} openCustomerEdit={openCustomerEdit} setOpenCustomerEdit={setOpenCustomerEdit} />
    </React.Fragment>

  )

}


export default Customers
