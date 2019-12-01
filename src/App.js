import React, { Component } from "react";
import Loader from './common/Loader';
import { Link } from 'react-router-dom';
import "./App.css";


export default class App extends Component {
	constructor( props ){
		super( props );

		this.state = {
			suggestions : [],
			loading 	: false,
			error 		: false,
			term 		: ''
		};

		this.$input = React.createRef();
	}

	beautifyNumber( x ){
		// reference - https://stackoverflow.com/a/2901298
		return x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, "," );
	}

	search( evt ){
		evt && evt.preventDefault();

		// if there is nothing to search then reset/clear suggestions 
		if( !this.$input.current.value.length ){ return this.setState({ suggestions : [] }) };

		// if we try to search the exact same thing, then dont bother just return
		if( this.state.term === this.$input.current.value ){ return };

		// show loader
		this.setState({ loading : true, term : this.$input.current.value });

		fetch( `https://api.github.com/search/repositories?q=${ encodeURIComponent( this.$input.current.value ) }&sort=stars&order=desc` )
			.then( res => {
				if( !res.ok ){
					throw new Error( res.status === 403 ? 'Rate Limit Exceeded, Please Try Again Shortly!' : 'Request Error' );
				};
				return res.json();
			})
			.then( res => {
				this.setState({
					suggestions : res.items,
					count : res.total_count,
					loading : false
				});
			})
			.catch( err => {
				this.setState({
					error : err,
					loading : false
				});
			});

	}

	suggestions(){
		if( this.state.error ){ return <h1>{ this.state.error.message }</h1> };
		if( this.state.loading ){ return <Loader /> };
		if( !this.state.suggestions.length ){ return };
		return (
			<>
				<span className="results-count">({ this.state.count } results)</span>
				<ul>
					{this.state.suggestions.map( suggestion => {
						return (
							<li key={ `${ suggestion.name }-${ suggestion.owner.login }` }>
								<Link className="suggestion-link" to={{ pathname : `/repository/${ suggestion.owner.login }/${ suggestion.name }`, state : suggestion }}>
									<div className="img-wrap">
										<img src={ suggestion.owner.avatar_url } alt="" />
									</div>
									<div className="info-wrap">
										<div className="left">
											<h3 className="name">{ suggestion.name }</h3>
											<span className="author">{ suggestion.owner.login }</span>
										</div>
										<div className="right">
											<div className="stars-wrap">
												<img src="./images/star-3.svg" alt={ `${ suggestion.stargazers_count } Stars` } />
												<span>{ this.beautifyNumber( suggestion.stargazers_count ) }</span>
											</div>
											<div className="watchers-wrap">
												<img src="./images/watchers-3.svg" alt={ `${ suggestion.watchers_count || suggestion.watchers } Watchers` } />
												<span>{ this.beautifyNumber( suggestion.watchers_count || suggestion.watchers ) }</span>
											</div>
										</div>
									</div>
								</Link>
							</li>
						);
					})}
				</ul>
			</>
		);
	}

	render() {
		return (
			<div className="home-page">
				<div className="logo-wrap">
					<img src="./images/github-logo.svg" alt="Github Search" />
				</div>
				<div className="search-wrap">
					<form onSubmit={ evt => evt.preventDefault() }>
						<div className="input-wrap">
							<input type="text" name="search-input" className="search-input" placeholder="Search Term" tabIndex="0" autoComplete="off" ref={ this.$input } onKeyUp={ evt => (evt.keyCode || evt.which) === 13 && this.search( evt ) } />
							<a href="#" className="search-link" onClick={ evt => this.search( evt ) }>
								<img src="./images/search-2.svg" alt="search" />
							</a>
							<div className="suggestions-wrap">
								{ this.suggestions() }
							</div>
						</div>
					</form>
					<p>Search github repositories.</p>
				</div>
			</div>
		);
	}
};
