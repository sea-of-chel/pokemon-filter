import React, { Component } from "react";
import axios from "axios";
//import './App.css'

function searchingFor(term){
  return function(x){
    return x.name.toLowerCase().includes(term || x.types[0].toLowerCase().includes(term) ||  !term;
  }
}

class App extends Component {
  // initialize our state 
  constructor(props){
    super(props);
    this.state = {
      users: [],
      term: '',
      isHidden: true
    }
  }

  // when component mounts, first thing it does is fetch all existing data in our db
  // then we incorporate a polling logic so that we can easily see if our db has 
  // changed and implement those changes into our UI
  componentDidMount() {
    this.getDataFromDb();
    if (!this.state.intervalIsSet) {
      let interval = setInterval(this.getDataFromDb, 1000);
      this.setState({ intervalIsSet: interval });
    }
  }

  searchHandler = (event) => {
    this.setState({
      term: event.target.value,
      isHidden: !event.target.value,
    });
  }

  // never let a process live forever 
  // always kill a process everytime we are done using it
  componentWillUnmount() {
    if (this.state.intervalIsSet) {
      clearInterval(this.state.intervalIsSet);
      this.setState({ intervalIsSet: null });
    }
  }

  // just a note, here, in the front end, we use the id key of our data object 
  // in order to identify which we want to Update or delete.
  // for our back end, we use the object id assigned by MongoDB to modify 
  // data base entries

  // our first get method that uses our backend api to 
  // fetch data from our data base
  getDataFromDb = () => {
    fetch("/api/getData")
      .then(data => data.json())
      .then(res => this.setState({ data: res.data }));
  };

  // our put method that uses our backend api
  // to create new query into our data base
  putDataToDB = message => {
    let currentIds = this.state.data.map(data => data.id);
    let idToBeAdded = 0;
    while (currentIds.includes(idToBeAdded)) {
      ++idToBeAdded;
    }

    axios.post("/api/putData", {
      id: idToBeAdded,
      message: message
    });
  };


  // our delete method that uses our backend api 
  // to remove existing database information
  deleteFromDB = idTodelete => {
    let objIdToDelete = null;
    this.state.data.forEach(dat => {
      if (dat.id == idTodelete) {
        objIdToDelete = dat._id;
      }
    });

    axios.delete("/api/deleteData", {
      data: {
        id: objIdToDelete
      }
    });
  };


  // our update method that uses our backend api
  // to overwrite existing data base information
  updateDB = (idToUpdate, updateToApply) => {
    let objIdToUpdate = null;
    this.state.data.forEach(dat => {
      if (dat.id == idToUpdate) {
        objIdToUpdate = dat._id;
      }
    });

    axios.post("/api/updateData", {
      id: objIdToUpdate,
      update: { message: updateToApply }
    });
  };


  // here is our UI
  // it is easy to understand their functions when you 
  // see them render into our screen
  render() {
    const { data, term, isHidden } = this.state;
    return (
      <div>
        <div className="wrapper">
          <form className="form-header">
            <h1 className="search-headline">Pokedex Search</h1>
            <label className="search-label">Search for Pokemon by breed or type</label>
            <input 
              placeholder="i.e. Pikachu or water" 
              className="input-style" 
              type="text" 
              onChange={this.searchHandler} 
              value={term}
            />
          </form> 
          {!isHidden &&
            <div className="pokemon-display">
              {data.filter(searchingFor(term)).map(dat =>
                <div className="pokemon-card" key={dat.name}>
                  <h1 className="pokemon-name">{dat.name}</h1>
                  <p className="pokemon-type">{dat.types[0]} {dat.types[1]}</p>
                </div>
              )}
            </div>}
        </div>
    </div>
    );
  }
}

export default App;