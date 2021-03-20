import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import Select from "react-select"
import {
  Container, Table,
  Modal, Button,
  Row, Col,
  Navbar
} from 'react-bootstrap'
import { BsPencilSquare, BsFillTrashFill } from "react-icons/bs";
import { useForm } from "react-hook-form"

import { useCollectionData } from 'react-firebase-hooks/firestore';

import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

if (firebase.apps.length === 0) {
  firebase.initializeApp({
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseUrl: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID
  })
}
const firestore = firebase.firestore()
const auth = firebase.auth()

const categories = [
  { id: 1, name: 'Food' },
  { id: 2, name: 'Fun' },
  { id: 3, name: 'Transportation' },
]

const allCategories = [
  { id: 0, name: 'All' },
  { id: 1, name: 'Food' },
  { id: 2, name: 'Fun' },
  { id: 3, name: 'Transportation' },
]

const styles = {
  alignRight: {
    textAlign: "right"
  }
}

function Journal(props) {
  const { register, handleSubmit, watch } = useForm()
  const [showModal, setShowModal] = useState(false)
  const [category, setCategory] = useState()
  const [categoryFilter, setCategoryFilter] = useState(allCategories[0])

  const [moneyRecords, setMoneyRecords] = useState()

  const moneyRef = firestore.collection('money');
  const query = moneyRef.orderBy('createdAt', 'asc').limitToLast(100);
  const [moneyList] = useCollectionData(query, { idField: 'id' });
  // const [formValue, setFormValue] = useState('');

  // for Modal form
  const [tempData, setTempData] = useState({ id: null, createdAt: new Date(), description: '', amount: 0, category: categories[0] })
  const [description, setDescription] = useState()
  const [amount, setAmount] = useState(0)
  const [editMode, setEditMode] = useState(false)

  const [total, setTotal] = useState(0)

  const createJournal = () => {
    let t = {
      createdAt: new Date(),
      description: '',
      amount: 0,
      category: categories[0]
    }
    console.log("createJournal", t)
    setTempData(t)
    setShowModal(true)
  }

  const updateJournal = (data) => {
    setEditMode(true)
    let t = {
      id: data.id,
      createdAt: data.createdAt.toDate(),
      description: data.description,
      amount: data.amount,
      category: data.category
    }
    console.log("updateJournal", t)
    setTempData(t)
    setCategory(data.category)  // this is handled by react-select
    // setDescription(data.description)
    // setAmount(data.amount)
    setShowModal(true)
  }

  const deleteJournal = (data) => {
    // console.log("deleteJournal", data.id)
    // console.log("--- data", moneyRef.doc(data.id))
    if (window.confirm(`Are you sure to delete ${data.description}?`))
      moneyRef.doc(data.id).delete()
  }

  // useEffect(() => {
  //   console.log('moneyList updated', typeof (moneyList), moneyList)
  //   if (moneyList) {
  //     // moneyList.forEach(m => console.log(moneyRef.doc(m.id).update({ _test: true })))
  //     let r = moneyList.map(data => <JournalRow data={data} updateJournal={updateJournal} deleteJournal={deleteJournal} />)
  //     setMoneyRecords(r)

  //     let t = moneyList.map(m => m.amount).reduce((total, amt) => parseFloat(total) + parseFloat(amt))
  //     // console.log({ t })
  //     setTotal(t)
  //   } else {
  //     setTotal(0)
  //   }
  // }, [moneyList])

  useEffect(() => {
    const fn = (m) => {
      try {
        return categoryFilter.id === 0 || m.category.id === categoryFilter.id
      } catch(e) {
        return true
      }
    }
    if (moneyList) {
      let r = moneyList.filter(fn).map(data => <JournalRow data={data} updateJournal={updateJournal} deleteJournal={deleteJournal} />)
      setMoneyRecords(r)

      let t = moneyList.filter(fn).map(m => m.amount).reduce((total, amt) => parseFloat(total) + parseFloat(amt))
      // console.log({ t })
      setTotal(t)
    }
  }, [moneyList, categoryFilter])

  const handleClose = () => {
    setShowModal(false)
  }

  const onSubmit = async (data) => {
    console.log('onSubmit ---------edit?', editMode)
    console.log('original data', data)
    let preparedData = {
      description: data.description,
      amount: parseFloat(data.amount),
      createdAt: data.createdAt instanceof Date ? data.createdAt : (new Date(data.createdAt)),
      category: category
    }
    console.log(`prepared data ${editMode ? 'edit' : 'add'}`, preparedData)

    // if (editMode) {

    // } else {
    //   // New record
    //   await moneyRef.add(data)
    // }
    // console.log("moneyRef",moneyRef)
    if (editMode) {
      console.log('moneyRef.doc(data.id)', moneyRef.doc(data.id))
      await moneyRef.doc(data.id)
        .set(preparedData)
        .then(() => console.log("moneyRef has been set"))
        .catch((error) => {
          console.error("Error writing document: ", error);
          alert(error)
        });
    } else {
      await moneyRef
        .add(preparedData)
        .then((v) => console.log("moneyRef has been added",v))
        .catch((error) => {
          console.error("Error writing document: ", error);
          alert(error)
        });

    }

    setEditMode(false)
    setShowModal(false)
  }

  const handleCategoryChange = (obj) => {
    setCategory(obj)
  }

  const handleCategoryFilterChange = (obj) => {
    console.log('filter', obj)
    setCategoryFilter(obj)
  }




  return (
    <Container>
      <Navbar>
        <Navbar.Brand href="#home">Money Journal</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            {props.user.displayName}
          </Navbar.Text>
          <SignOut />
        </Navbar.Collapse>
      </Navbar>
      <Row key={0}>
        <Col className="md-10">
          <Button variant="success" onClick={createJournal}>ADD</Button>
        </Col>
        <Col className="md-2 float-right">
          <Select
            id="categoryFilter"
            name="categoryFilter"
            placeholder="Category Filter"
            value={categoryFilter}
            options={allCategories}
            onChange={handleCategoryFilterChange}
            getOptionLabel={x => x.name}
            getOptionValue={x => x.id}
          />
        </Col>
      </Row>

      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>#</th>
            <th>Date/Time</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {moneyRecords}
          <tr key={'total'}>
            <td colSpan={3}>
              <h2>Total : {nformat(total)}</h2>
            </td>
          </tr>
        </tbody>
      </Table>

      <Modal
        show={showModal}
        onHide={handleClose}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" name="id" defaultValue={tempData.id} ref={register} />
          <Modal.Header closeButton>
            <Modal.Title>Add Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col>
                <label htmlFor="createdAt">Date</label>
              </Col>
              <Col>
                <input
                  type="date"
                  placeholder="Date"
                  ref={register({ required: true })}
                  name="createdAt"
                  id="createdAt"
                  defaultValue={format(tempData.createdAt, "yyyy-MM-dd")}
                />

              </Col>
            </Row>

            <Row>
              <Col>
                <label htmlFor="category">Category</label>
              </Col>
              <Col>
                <Select
                  id="category"
                  name="category"
                  value={category}
                  placeholder="Category"
                  options={categories}
                  onChange={handleCategoryChange}
                  getOptionLabel={x => x.name}
                  getOptionValue={x => x.id}
                />
              </Col>
            </Row>

            <Row>
              <Col>
                <label htmlFor="description">Description</label>
              </Col>
              <Col>
                <input
                  type="text"
                  placeholder="Description"
                  ref={register({ required: true })}
                  name="description"
                  id="description"
                  defaultValue={tempData.description}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <label htmlFor="amount">Amount</label>
              </Col>
              <Col>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Amount"
                  ref={register({ required: true })}
                  name="amount"
                  id="amount"
                  defaultValue={tempData.amount}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Close</Button>
            <Button variant="primary" type="submit">
              {editMode ? "Save" : "Add"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </Container>
  );
}

const nformat = (x) => {
  return parseFloat(x).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function SignOut() {
  return auth.currentUser && (
    <Button className="btn-sm" variant="outline-dark" onClick={() => auth.signOut()}>Sign Out</Button>

  )
}

function JournalRow({ data, updateJournal, deleteJournal }) {
  if (data) {
    // console.log("JournalRow", data)
    return (
      <tr key={data.id}>
        <td>
          <BsPencilSquare onClick={() => updateJournal(data)} />
          <BsFillTrashFill onClick={() => deleteJournal(data)} />
        </td>
        <td>
          {format(data.createdAt.toDate(), 'dd MMM yy')}
        </td>
        <td>{data.description}</td>
        <td>{data.category.name}</td>
        <td style={styles.alignRight}>{nformat(data.amount)}</td>
      </tr>
    )
  }
}
export default Journal;
