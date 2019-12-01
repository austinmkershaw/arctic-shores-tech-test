import React, { Component } from "react";
import "../App.css";
import Loader from "../common/Loader";

export default class Repository extends Component { 
    constructor( props ){
        super( props );
        this.state = {
            user : {
                repositories : []
            },
            languages : {},
            contributors : [],
            ...this.props.location.state
        };
    }

    getPageData(){
        return Promise.all([
            fetch( this.state.languages_url ).then( res => res.json() ),
            fetch( this.state.contributors_url ).then( res => res.json() ),
            fetch( `${ this.state.owner.repos_url }?per_page=100` ).then( res => res.json() )
        ])
        .then( res => {
            this.setState({
                languages : res[0],
                contributors : res[1],
                user : {
                    repositories : res[2]
                }
            })
        })
        .catch( error => { this.setState({ error }) });
    }

    componentWillMount(){
        if( this.props.location.state ){
            // if we navigated from the search page then we already have the basic repo data, so just get the extra bits for the page
            this.getPageData();
        }else{
            // we navigated directly to this page so we need to get the basic repo data first
            this.setState({ loading : true });
            fetch( `https://api.github.com/repos/${ this.props.match.params.user }/${ this.props.match.params.repository }` )
                .then( res => {
                    if( !res.ok ){
                        throw new Error( res.status === 403 ? 'Rate Limit Exceeded, Please Try Again Shortly!' : 'Request Error' );
                    };
                    return res.json();
                })
                .then( res => { this.setState({ loading : false, ...res }, () => this.getPageData() ) })
                .catch( error => { this.setState({ loading : false, error }) });
        }

    }

    stripCurlyBraces( str ){
        return str.replace( /\{([^}]+)\}/g, '' );
    }

    convertToHtmlLink( str ){
        return this.stripCurlyBraces( str ).replace( 'api.', '' ).replace( '/repos', '' );
    }

    repositories(){
        if( !this.state.user.repositories.length ){ return };
        return this.state.user.repositories.map( repo => {
            return (
                <li key={ repo.name }>
                    <a href={ repo.html_url } target="_blank" { ...( repo.name === this.state.name ? { className : "current" } : {} ) } >
                        { repo.name }
                    </a>
                </li>
            );
        });
    }

    personal(){
        return (
            <div className="personal-wrap">
                <a href={ this.state.owner.html_url } className="img-wrap" title={ this.state.owner.login } target="_blank">
                    <img src={ this.state.owner.avatar_url } alt={ this.state.owner.login } />
                </a>
                <a href={ this.state.owner.html_url } title={ this.state.owner.login } target="_blank">
                    <h2 className="username">{ this.state.owner.login }</h2>
                </a>
                <div className="repo-list-wrap">
                    <span>Repositories</span>
                    <ul className="repo-list">
                        { this.repositories() }
                    </ul>
                </div>
            </div>
        );
    }

    languages(){
        if( !Object.keys( this.state.languages ).length ){ return };
        return (
            <span className="languages">
                { Object.keys( this.state.languages ).map( language => language ).join( ', ' ) }
            </span>
        );
    }

    contributers(){
        if( !this.state.contributors.length ){ return };
        return (
            <div className="contributers-wrap">
                <h3>Contributers</h3>
                <ul>
                    { this.state.contributors.map( contributer => {
                        return (
                            <li key={ contributer.login }>
                                <a href={ contributer.html_url } title={ contributer.login } target="_blank">
                                    <img src={ contributer.avatar_url } alt={ contributer.login } />
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    summary(){
        return (
            <ul className="summary-list">
                <li>
                    <a href={ this.state.html_url } title="Go to Repository" target="_blank">
                        <span className="label">Github</span>
                        <span className="icon">
                            <img src="../../images/external.svg" alt="Go to Repository" />
                        </span>
                    </a>
                </li>
                <li>
                    <a href={ this.convertToHtmlLink( this.state.releases_url ) } title="Go to Releases" target="_blank">
                        <span className="label">Releases</span>
                        <span className="icon">
                            <img src="../../images/releases.svg" alt="Go to Releases" />
                        </span>
                    </a>
                </li>
                <li>
                    <a href={ this.convertToHtmlLink( this.state.issues_url ) } title="Go to Issues" target="_blank">
                        <span className="label">Issues</span>
                        <span className="icon">
                            <img src="../../images/issues.svg" alt="Go to Issues" />
                        </span>
                    </a>
                </li>
                <li>
                    <a href={ this.convertToHtmlLink( this.state.stargazers_url ) } title="Go to Stars" target="_blank">
                        <span className="label">Stars</span>
                        <span className="icon">
                            <img src="../../images/star.svg" alt="Go to Stars" />
                        </span>
                    </a>
                </li>
            </ul>
        );
    }

    repo(){
        return (
            <div className="repo-wrap">
                <div className="title-wrap">
                    <span>repository</span>
                    <h1 className="repo-title">{ this.state.name }</h1>
                    <span className="repo-privacy">
                        <img src={ this.state.private ? "../../images/locked.svg" : "../../images/unlocked.svg" } alt={ this.state.private ? "Private Repository" : "Public Repository" } />
                    </span>
                </div>
                { this.summary() }
                { this.languages() }
                <p className="repo-description">{ this.state.description }</p>
                { this.contributers() }
                <span className="updated">Updated: { this.state.updated_at.split( 'T' )[0] }</span>
            </div>
        );
    }

	render() {
        if( this.state.error ){ return <div className="page-center"><h1>{ this.state.error.message }</h1></div> };
        if( this.state.loading ){ return <div className="page-center"><Loader /></div> };
		return (
			<div className="repository-page">
				{ this.personal() }
				{ this.repo() }
			</div>
		);
	}
};
