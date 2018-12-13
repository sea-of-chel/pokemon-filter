import React, { Component } from "react";
import './App.css';

function searchingFor(term){
  return function(x){
    return x.name.toLowerCase().includes(term.toLowerCase()) || x.types[0].toLowerCase().includes(term.toLowerCase()) ||  !term;
  };
}

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      users: [],
      term: '',
      isHidden: true
    }
  }

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

  componentWillUnmount() {
    if (this.state.intervalIsSet) {
      clearInterval(this.state.intervalIsSet);
      this.setState({ intervalIsSet: null });
    }
  }

  getDataFromDb = () => {
    fetch("/api/getData")
      .then(data => data.json())
      .then(res => this.setState({ data: res.data }));
  };

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