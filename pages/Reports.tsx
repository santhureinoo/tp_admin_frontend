import type { NextPage } from 'next'
import Table from '../components/Table'
import React from 'react';
import TableOptionField from '../components/TableOptionField';
import Searchfield from '../components/Searchfield';
import EquipmentEdit from '../components/EquipmentEdit';
import { v4 as uuidv4 } from 'uuid';
import { customer, group, outlet, outlet_device_ex_fa_input, reports, results } from '../types/datatype';
import ClientOnly from '../components/ClientOnly';
import { gql, useLazyQuery, useQuery, WatchQueryFetchPolicy } from '@apollo/client';
import { DropdownProps } from '../common/types';
import ReportEdit from '../components/ReportEdit';
import PillButton from '../components/PillButton';
import moment from 'moment';
import CustomizedDropDown from '../components/CustomizedDropDown';
import ReportSteps from '../components/report/ReportSteps';
import InvoiceEdit from '../components/InvoiceEdit';

const Reports: NextPage = () => {
  return (
    <React.Fragment>
      <ClientOnly>
        <ReportTable></ReportTable>
      </ClientOnly>
    </React.Fragment>
  )
}

Reports.getInitialProps = async () => {
  const title = "Reports";
  return { title };
};

const ReportTable: any = () => {
  const [openReportEdit, setOpenReportEdit] = React.useState(false);
  const [selectedSubTitle, setSelectedSubTitle] = React.useState("Generate");
  const [selectedOutletID, setSelectedOutletID] = React.useState("");
  const [results, setResults] = React.useState<results[]>([]);
  // const [equipments, setEquipments] = React.useState<outlet_device_ex_fa_input[]>([]);
  const [selectedResult, setSelectedResult] = React.useState<results>();

  //Invoice
  const [selectedInvoicePte, setSelectedInvoicePte] = React.useState("1");
  const [selectedInvoiceMonth, setSelectedInvoiceMonth] = React.useState("All");
  const [selectedInvoiceYear, setSelectedInvoiceYear] = React.useState("All");
  const [allPte, setAllPte] = React.useState<DropdownProps[]>([]);
  const [invoices, setInvoices] = React.useState<
    {
      id: String, pte: String,
      month: String, year: String,
      outlets: number, lastAvailTariff: String,
      mesKwh: String, mesExpenses: String,
      mesPercent: String
    }[]
  >([]);

  //Savings
  const [selectedCustomerType, setSelectedCustomerType] = React.useState<'Group' | 'Outlet'>('Group');
  const [selectedCustomerId, setSelectedCustomerId] = React.useState("");
  const [customers, setCustomers] = React.useState<customer[]>([]);
  const [selectedSavingsOutletID, setSelectedSavingsOutletID] = React.useState("");
  const [selectedSavingsMonth, setSelectedSavingsMonth] = React.useState("All");
  const [selectedSavingsYear, setSelectedSavingsYear] = React.useState("All");
  const [savingReportData, setSavingReportData] = React.useState<any[]>([]);
  const [selectedReportID, setSelectedReportID] = React.useState({
    reportId: 0,
    selectedMonth: "",
    selectedYear: "",
  });
  const [totalSavingPage, setTotalSavingPage] = React.useState(1);
  const [selectedSavingPageIndex, setSelectedSavingPageIndex] = React.useState(1);

  const getOutletsQuery = gql`
  query Outlets{
    outlets {
      outlet_id
      name
    }
  }
  `;

  const getCustomerQuery = gql`query Customers {
    customers {
      customer_id
      pte_ltd_name
      outlet {
        outlet_id
        name
      }
    }
  }`;

  const getReportsByOutletIDVariable = {
    "variables": {
      "where": {
        "outlet_id": {
          "equals": parseInt(selectedSavingsOutletID)
        },
        ...(selectedSavingsMonth !== 'All') && {
          "month": {
            "equals": selectedSavingsMonth
          }
        },
        ...(selectedSavingsYear !== 'All') && {
          "year": {
            "equals": selectedSavingsYear
          }
        },

      },
      "take": 5,
      "skip": (selectedSavingPageIndex * 5) - 5
    },
  };

  const getReportsByOutletIdQuery = gql`
  query FindManyReports($where: ReportsWhereInput,$take: Int, $skip: Int) {
    findManyReports(where: $where,take: $take, skip: $skip) {
      report_id
      outlet_id
      customer_id
      group_id
      year
      month
      last_avail_tariff
      outlet_measured_savings_kWh
      outlet_measured_savings_expenses
      outlet_measured_savings_percent
      outlet {
        name
      }
      customer {
        pte_ltd_name
      }
    }
  }`;

  const groupBy = (arr: any[], groupByKey: string) => {
    arr.reduce(function (r, a) {
      r[a[groupByKey]] = r[a[groupByKey]] || [];
      r[a[groupByKey]].push(a);
      return r;
    }, Object.create(null));
  }
  const getGroupsVariable = {
    "variables": {
      "where": {
        ...(selectedSavingsMonth !== 'All') && {
          "month": {
            "equals": selectedSavingsMonth
          }
        },
        ...(selectedSavingsYear !== 'All') && {
          "year": {
            "equals": selectedSavingsYear
          }
        },

      }
    },
  };

  const reportTotalVariable = {
    "variables": {
      "where": {
        "outlet_id": {
          "equals": parseInt(selectedSavingsOutletID)
        },
        ...(selectedSavingsMonth !== 'All') && {
          "month": {
            "equals": selectedSavingsMonth
          }
        },
        ...(selectedSavingsYear !== 'All') && {
          "year": {
            "equals": selectedSavingsYear
          }
        },

      },
    },
  };

  const reportTotalQuery = gql`
  query _count($where: ReportsWhereInput) {
    aggregateReports(where: $where) {
      _count {
        _all
      }
    }
  }`;

  const groupReportTotalVariable = {
    "variables": {
      "where": {
        ...(selectedSavingsMonth !== 'All') && {
          "month": {
            "equals": selectedSavingsMonth
          }
        },
        ...(selectedSavingsYear !== 'All') && {
          "year": {
            "equals": selectedSavingsYear
          }
        },

      },
    },
  };

  const groupReportTotalQuery = gql`
  query _count($where: GroupWhereInput) {
    aggregateGroup(where: $where) {
      _count {
        _all
      }
    }
  }`;


  const getGroupsQuery = gql`
  query _count($where: ReportsWhereInput) {
    groups {
      group_id
      group_name
      reports(where: $where) {
        customer {
          outlet {
            outlet_id
          }
        }
        month
        year
        outlet_measured_savings_expenses
        outlet_measured_savings_kWh
        outlet_measured_savings_percent
        last_avail_tariff
      }
    }
  }`;

  const getResultsVariable = React.useMemo(() => {
    return {
      "variables": {
        "where": {
          "outlet_id": {
            "equals": parseInt(selectedOutletID)
          }
        },
        "omWhere": {
          "outlet_outlet_id": {
            "equals": parseInt(selectedOutletID)
          }
        }
      }
    }
  }, [selectedOutletID]);

  const getResultsQuery = gql`
  query FindManyResults($where: ResultsWhereInput,$omWhere: Outlet_monthWhereInput) {
    findManyResults(where: $where) {
      outlet_id
      outlet_date
      ke_measured_savings_kWh
      ac_measured_savings_kWh
      acmv_measured_savings_kWh
      outlet_measured_savings_kWh
      outlet_measured_savings_expenses
      outlet_measured_savings_percent
      co2_savings_kg
      savings_tariff_expenses
      tp_sales_expenses
      ke_eqpt_energy_baseline_avg_hourly_kW
      ac_eqpt_energy_baseline_avg_hourly_kW
      acmv_eqpt_energy_baseline_avg_hourly_kW
      ke_eqpt_energy_baseline_avg_hourly_as_date
      ac_eqpt_energy_baseline_avg_hourly_as_date
      acmv_eqpt_energy_baseline_avg_hourly_as_date
      ke_eqpt_energy_usage_without_TP_month_kW
      ac_eqpt_energy_usage_without_TP_month_kW
      outlet_eqpt_energy_usage_without_TP_month_kW
      outlet_eqpt_energy_usage_without_TP_month_expenses
      ke_eqpt_energy_usage_with_TP_month_kW
      ac_eqpt_energy_usage_with_TP_month_kW
      outlet_eqpt_energy_usage_with_TP_month_kW
      outlet_eqpt_energy_usage_with_TP_month_expenses
      acmv_25percent_benchmark_comparison_kWh
      acmv_25percent_benchmark_comparison_expenses
      acmv_10percent_benchmark_comparison_kWh
      acmv_10percent_benchmark_comparison_expenses
      ke_and_ac_25percent_benchmark_comparison_kWh
      ke_and_ac_25percent_benchmark_comparison_expenses
      monday
      tuesday
      wednesday
      thursday
      friday
      saturday
      sunday
      holiday
      outlet {
        name
        outlet_device_ex_fa_input {
          od_device_input_id
        }
        outlet_device_ac_input {
          od_device_input_id
        }
        outlet_month(where: $omWhere) {
          last_avail_tariff
        }
      }
    }
  }
  `;

  const getPteQuery = gql`
  query Customers {
    customers {
      customer_id
      name
      pte_ltd_name
      pic_name
      pic_phone
      country
      city
      current_address
      postal_code
      group_id
    }
  }`;

  const outletsResult = useQuery(getOutletsQuery);
  const resultsResult = useQuery(getResultsQuery, getResultsVariable);
  const getReportsByOutletIdResult = useLazyQuery(getReportsByOutletIdQuery, getReportsByOutletIDVariable);
  const getGroupsResult = useLazyQuery(getGroupsQuery, getGroupsVariable);
  // const getReportsByCustomerIdResult = useLazyQuery(getReportsByCustomerIDQuery, getReportsByCustomerIDVariable);
  const customerResult = useQuery(getCustomerQuery);
  const reportTotalResult = useLazyQuery(reportTotalQuery, reportTotalVariable);
  const groupReportTotalResult = useLazyQuery(groupReportTotalQuery, groupReportTotalVariable);
  const getPteResult = useLazyQuery(getPteQuery);

  const outletDropdown: DropdownProps[] = React.useMemo(() => {
    if (outletsResult.data && outletsResult.data.outlets.length > 0) {
      setSelectedOutletID(outletsResult.data.outlets[0].outlet_id)
      return outletsResult.data.outlets.map((outlet: outlet) => {
        return { key: outlet.outlet_id, value: outlet.name };
      })
    } else {
      return [];
    }
  }, [outletsResult.data]);

  const pteDropdown: DropdownProps[] = React.useMemo(() => {
    if (customerResult.data && customerResult.data.customers.length > 0) {
      setSelectedCustomerId(customerResult.data.customers[0].customer_id);
      return customerResult.data.customers.map((customer: any) => {
        return { key: customer.customer_id, value: customer.pte_ltd_name };
      })
    } else {
      return [];
    }
  }, [customerResult.data]);

  const savingOutletDropdown: DropdownProps[] = React.useMemo(() => {
    if (customerResult.data && customerResult.data.customers.length > 0) {
      const customerData: any[] = customerResult.data.customers;

      const selectedOutlets = customerData.filter((dat: any) => {
        if (dat.customer_id === selectedCustomerId) {
          return true;
        } else {
          return false;
        }
      }).map((dat: any) => {
        return dat.outlet;
      })

      let data = [];

      if (selectedOutlets.length > 0) {
        data = selectedOutlets[0].map((outlet: any) => {
          return { key: outlet.outlet_id, value: outlet.name };
        })
      }
      return data;
    } else {
      return [];
    }
  }, [customerResult.data, selectedCustomerId]);

  // Hooks 
  React.useEffect(() => {
    if (resultsResult.data && resultsResult.data.findManyResults) {
      setResults(resultsResult.data.findManyResults);
    }
  }, [resultsResult]);

  React.useEffect(() => {
    if (savingOutletDropdown.length > 0) {
      setSelectedSavingsOutletID(savingOutletDropdown[0].key);
    }
  }, [savingOutletDropdown]);


  // Need to use Lazy Query on each sub title changes instead of fetching all at once.
  React.useEffect(() => {
    if (selectedSubTitle === 'Invoice') {
      getPteResult[0]().then(res => {
        if (res.data && res.data.customers) {
          const customers: customer[] = res.data.customers;
          setAllPte(customers.map((cus, index) => {
            if (index === 0) {
              setSelectedInvoicePte(cus.customer_id.toString());
            }
            return {
              key: cus.customer_id.toString(),
              value: cus.pte_ltd_name || ''
            }
          }))
        }
      })
    }
  }, [selectedSubTitle])


  const dummyDatForGenerate = (): any[][] => {

    const arr = [];

    for (let i = 1; i < 10; i++) {
      arr.push([
        "", `10/0${i}/2022`, '2022', 'Jan', 'Bulk', 'ID30599608', 'Success', '30', '0', '0', 'Available'
      ]);
    }
    return arr;
  }

  const month = ["All", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const action = ["Create", "Update", "Delete"];

  const generateTable = React.useMemo(() => {
    return <React.Fragment>
      <Table
        headers={['', 'Uploaded at', 'Year', 'Month', 'Input Type', 'Report ID', 'Status', 'Total Updated Outlet', 'Total Error Found', 'Report Status', 'Invoice Status']}
        onlyShowButton={true}
        data={dummyDatForGenerate()}
        leftSideElements={[]}
        hideDetailMenu={true}
        rightSideElements={[
          <TableOptionField key={uuidv4()} label={'Select Month'} onChange={(selectedValue: string) => { setSelectedOutletID(selectedValue) }}
            selectedValue={"Jan"} data={month} />,
          <TableOptionField key={uuidv4()} label={'Select Month'} onChange={(selectedValue: string) => { setSelectedOutletID(selectedValue) }}
            selectedValue={"Jan"} data={month} />,
          <span key={uuidv4()} className='w-12'></span>,
          <TableOptionField key={uuidv4()} label={'Action'} onChange={(selectedValue: string) => { setSelectedOutletID(selectedValue) }}
            selectedValue={"Delete"} data={action} />
        ]}
        handleEdit={(selectedData) => { setSelectedResult(results.find(res => res.outlet_date === selectedData[7])); setOpenReportEdit(true) }} handleDelete={() => setOpenReportEdit(true)} />
    </React.Fragment>
  }, []);

  React.useEffect(() => {
    const arr: any[] = [];
    if (selectedCustomerType === 'Group') {
      getGroupsResult[0]({ 'fetchPolicy': 'no-cache' as WatchQueryFetchPolicy }).then((res: any) => {
        const arr: any[] = [];
        if (res && res.data && res.data.groups) {
          const groups = res.data.groups as group[];
          groups.forEach(group => {
            if (group.reports) {
              let innerArr: any[] = [];
              let totalSavingTariff = "$0";
              group.reports.forEach(report => {
                let isFound = -1;
                if (arr.length > 0) {
                  isFound = arr.findIndex(item => {
                    return item[2] === report.month && item[3] === report.year;
                  });
                }

                if (isFound < 0) {
                  innerArr.push(group.group_id);
                  innerArr.push(group.group_name);
                  let outletCount = 0;
                  innerArr.push(report.month, report.year);
                  totalSavingTariff = "$ 0.40";

                  //Get the total outlet count by the customer.
                  if (report.customer && report.customer.outlet) {
                    outletCount = outletCount + report.customer.outlet.length;
                  }
                  innerArr.push(outletCount);
                  innerArr.push(totalSavingTariff);
                  innerArr.push(<div className='flex flex-row gap-x-4'>
                    <div className='flex flex-col'>
                      <span className='text-custom-xs'>
                        (kWH)
                      </span>
                      <span>
                        97
                      </span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-custom-xs'>
                        ($)
                      </span>
                      <span>
                        $0.20
                      </span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-custom-xs'>
                        (%)
                      </span>
                      <span>
                        30%
                      </span>
                    </div>
                  </div>);
                  arr.push(innerArr);
                  innerArr = [];
                } else {
                  innerArr = []
                }
              });
            }
          })
          setSavingReportData(arr);
        } else {
          setSavingReportData([]);
        }
      });



      // groupReportTotalResult[0]({ 'fetchPolicy': 'no-cache' as WatchQueryFetchPolicy }).then(res => {
      //   if (res.data && res.data.aggregateGroup._count._all) {
      //     const total = res.data.aggregateGroup._count._all;
      //     const pageCount = total != 0 ? Math.ceil(total / 5) : 1;
      //     setTotalSavingPage(pageCount);
      //     setSelectedSavingPageIndex(1);
      //   }
      // })

      setTotalSavingPage(0);
    } else {
      getReportsByOutletIdResult[0]({ 'fetchPolicy': 'no-cache' as WatchQueryFetchPolicy }).then((res: any) => {
        const arr = [];
        if (res && res.data && res.data.findManyReports) {
          const reports = res.data.findManyReports as reports[];
          for (let i = 0; i < reports.length; i++) {
            const cur = reports[i];
            arr.push([
              cur.report_id, cur.outlet?.name, cur.month, cur.year, '1', '$ 0.20',
              <div key={'frag ' + i} className='flex flex-row gap-x-4'>
                <div className='flex flex-col'>
                  <span className='text-custom-xs'>
                    (kWH)
                  </span>
                  <span>
                    97
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-custom-xs'>
                    ($)
                  </span>
                  <span>
                    $0.20
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-custom-xs'>
                    (%)
                  </span>
                  <span>
                    30%
                  </span>
                </div>
              </div>
            ]);
          }
          setSavingReportData(arr);
        } else {
          setSavingReportData([]);
        }
      });
    }
  }, [selectedCustomerType, selectedSavingsMonth, selectedSavingsYear, selectedSavingsOutletID, selectedSavingPageIndex])

  React.useEffect(() => {
    if (selectedCustomerType === "Outlet") {
      reportTotalResult[0]({ 'fetchPolicy': 'no-cache' as WatchQueryFetchPolicy }).then(res => {
        if (res.data && res.data.aggregateReports._count._all) {
          const total = res.data.aggregateReports._count._all;
          const pageCount = total != 0 ? Math.ceil(total / 5) : 1;
          setTotalSavingPage(pageCount > 1 ? pageCount : 0);
          setSelectedSavingPageIndex(1);
        } else {
          setTotalSavingPage(0);
        }
      })
    }

  }, [selectedSavingsOutletID, selectedCustomerType, selectedSavingsMonth, selectedSavingsYear]);

  const savingTable = React.useMemo(() => {

    const headers = () => {
      if (selectedCustomerType === 'Outlet') {
        return ['Report ID', 'Outlet Name', 'Month', 'Year', 'Equipment', 'Last Avaiable Tariff ($/kWh)', 'Measured Energy Savings'];
      } else {
        return ['Report ID', 'Group Name', 'Month', 'Year', 'Live Outlets', 'Savings @ Tariff', 'Measured Energy Savings'];
      }
    }

    const savingsSubMenu = (): React.ReactElement => {
      return (<div className={`flex flex-row ${selectedCustomerType === 'Outlet' ? 'justify-between' : 'justify-end'}`}>
        {selectedCustomerType === 'Outlet' && <div className='flex flex-row gap-x-2'>
          <TableOptionField key={uuidv4()} label={'Pte Ltd'} onChange={(selectedValue: string) => { setSelectedCustomerId(selectedValue) }}
            selectedValue={selectedCustomerId} data={pteDropdown} />
          <TableOptionField key={uuidv4()} label={'Outlet'} onChange={(selectedValue: string) => { setSelectedSavingsOutletID(selectedValue) }}
            selectedValue={selectedSavingsOutletID} data={savingOutletDropdown} />
        </div>}
        <div className='flex flex-row gap-x-2'>
          <TableOptionField key={uuidv4()} label={'Month'} onChange={(selectedValue: string) => { setSelectedSavingsMonth(selectedValue) }}
            selectedValue={selectedSavingsMonth} data={month} />
          <TableOptionField key={uuidv4()} label={'Year'} onChange={(selectedValue: string) => { setSelectedSavingsYear(selectedValue) }}
            selectedValue={selectedSavingsYear} data={['All', '2021', '2020', '2022']} />
        </div>
      </div>)
    }

    return <React.Fragment>
      <Table
        headers={headers()}
        onlyShowButton={true}
        data={savingReportData}
        totalNumberOfPages={totalSavingPage}
        setCurrentSelectedPage={setSelectedSavingPageIndex}
        currentSelectedPage={selectedSavingPageIndex}
        leftSideElements={[<TableOptionField key={uuidv4()} label={'Customer Type'} onChange={(selectedValue: any) => { setSelectedCustomerType(selectedValue); setSelectedSavingsMonth("All"); setSelectedSavingsYear("All") }}
          selectedValue={selectedCustomerType} data={['Group', 'Outlet']} />, savingsSubMenu()]}
        leftSideFlexDirection={"Vertical"}
        rightSideElements={[]}
        handleEdit={(selectedData) => {
          setSelectedReportID({
            reportId: parseInt(selectedData[0]),
            selectedMonth: selectedData[2],
            selectedYear: selectedData[3]
          }); setOpenReportEdit(true)
        }} handleDelete={() => setOpenReportEdit(true)} />
    </React.Fragment>
  }, [selectedCustomerType, selectedCustomerId, selectedSavingPageIndex, totalSavingPage, savingReportData, selectedSavingsOutletID, selectedSavingsMonth, selectedSavingsYear, savingOutletDropdown]);

  const dummyDatForInvoices = (): any[][] => {

    const arr = [];

    for (let i = 1; i < 10; i++) {
      arr.push([
        `EQ-240${i}`, 'KFC Indonesia', 'Jan', '2022', '15', '$ 0.3486',
        <div key={'frag ' + i} className='flex flex-row gap-x-4'>
          <div className='flex flex-col'>
            <span className='text-custom-xs'>
              (kWH)
            </span>
            <span>
              97
            </span>
          </div>
          <div className='flex flex-col'>
            <span className='text-custom-xs'>
              ($)
            </span>
            <span>
              $0.20
            </span>
          </div>
          <div className='flex flex-col'>
            <span className='text-custom-xs'>
              (%)
            </span>
            <span>
              30%
            </span>
          </div>
        </div>, '$ 4,203'
      ]);
    }
    return arr;
  }

  const invoiceTable = React.useMemo(() => {
    return <React.Fragment>
      <Table
        headers={['Invoice ID', 'Pte Ltd Name', 'Month', 'Year', 'Outlets', 'Last Avaiable Tariff', 'Measured Energy Savings']}
        hiddenDataColIndex={[7]}
        onlyShowButton={true}
        data={dummyDatForInvoices()}
        leftSideElements={[<TableOptionField key={uuidv4()} label={'Pte Ltd'} onChange={(selectedValue: string) => { setSelectedInvoicePte(selectedValue) }}
          selectedValue={selectedInvoicePte} data={allPte} />,]}
        rightSideElements={[
          <TableOptionField key={uuidv4()} label={'Month'} onChange={(selectedValue: string) => { setSelectedInvoiceMonth(selectedValue) }}
            selectedValue={selectedInvoiceMonth} data={month} />,
          <TableOptionField key={uuidv4()} label={'Year'} onChange={(selectedValue: string) => { setSelectedInvoiceYear(selectedValue) }}
            selectedValue={selectedInvoiceYear} data={["All", "2022", "2020"]} />,
        ]}
        handleEdit={(selectedData) => { setSelectedResult(results[0]); setOpenReportEdit(true) }} handleDelete={() => setOpenReportEdit(true)} />
    </React.Fragment>
  }, [selectedInvoiceMonth, selectedInvoiceYear, selectedInvoicePte, setSelectedInvoicePte, allPte]);


  const reportEditComp = React.useMemo(() => {
    return <React.Fragment>
      <Table
        headers={['Report ID', 'Outlet Name', 'Month', 'Year', 'Equipment', 'Last Avaiable Tariff ($/kWh)', 'Measured Energy']}
        hiddenDataColIndex={[7]}
        onlyShowButton={true}
        data={dummyDatForInvoices()}
        leftSideElements={[]}
        rightSideElements={[
          <TableOptionField key={uuidv4()} label={'Outlet'} onChange={(selectedValue: string) => { setSelectedOutletID(selectedValue) }}
            selectedValue={selectedOutletID} data={outletDropdown} />,
        ]}
        handleEdit={(selectedData) => { setSelectedResult(results[0]); setOpenReportEdit(true) }} handleDelete={() => setOpenReportEdit(true)} />
    </React.Fragment>
  }, [selectedCustomerType]);

  return (
    <React.Fragment>
      <div className='flex flex-row'>
        <h3 className="text-gray-700 text-3xl font-bold">Reports: </h3>
        <CustomizedDropDown hideBorder={true} customCSS='text-3xl' inputType={'dropdown'} hidePrefixIcons={true} data={["Generate", "Savings", "Invoice", "ReportStep"]} selected={selectedSubTitle} setSelected={(selected: string) => { setSelectedSubTitle(selected) }} />
      </div>

      <div className="flex flex-col mt-8">
        <div className="-my-2 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div
            className="align-middle inline-block min-w-full sm:rounded-lg">
            {selectedSubTitle === "Generate" ?
              generateTable
              : selectedSubTitle === "Savings" ?
                savingTable : selectedSubTitle === "Invoice" ? invoiceTable : <React.Fragment><ReportSteps></ReportSteps></React.Fragment>
            }
            {selectedSubTitle === "Savings" ?
              <ReportEdit selectedReportID={selectedReportID.reportId} result={selectedResult} openReportEdit={openReportEdit} customerType={selectedCustomerType} setOpenReportEdit={setOpenReportEdit} month={selectedReportID.selectedMonth} year={selectedReportID.selectedYear} /> :
              <InvoiceEdit result={selectedResult} openReportEdit={openReportEdit} setOpenReportEdit={setOpenReportEdit} billingData={{
                IID: 'Set-2095860',
                CUS: 'KFC Holding Indonesia',
                PER: 'Sep, 2022',
                OUT: '5',
                TSF: '$485.09',
                TSS: '$250',
                TSK: (<div className="flex flex-row gap-x-6 items-center justify-between"><span>470</span><PillButton className={"w-40 h-8"} text={"Invoice Generated"} /></div>),
                STA: 'Generated',
              }} />}
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Reports
