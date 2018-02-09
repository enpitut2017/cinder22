/*
 * Copyright (c) 2014 Cesanta Software Limited
 * All rights reserved
 */
#include<iostream>
#include<sstream>
#include<fstream>
#include<map>
#include<set>
#include<vector>
#include "mongoose.c"
#include "mongoose.h"
using namespace std;
static const char *s_http_port = "8000";
static struct mg_serve_http_opts s_http_server_opts;
map<string,int> m;
map<int,string> v;
int V[5000000];
int E[100000000];
int Vnext[5000000];
int Vy[5000000];
int Ey[100000000];
int Vynext[5000000];
vector<pair<int,int> > calc(string word){
  word = "\'" + word + "\'";
  if(m.find(word) == m.end()){
    cout << "word not found" << endl;
  }
  cout << m[word] << endl;
  vector<int> wlist;
  for(int i = Vy[m[word]];i < Vynext[m[word]];i++){
    wlist.push_back(Ey[i]);
  }
  map<int, int> cnt_word;
  for(int i = 0;i < wlist.size();i++){
    for(int j = V[wlist[i]];j < Vnext[wlist[i]];j++){
      if(cnt_word.find(E[j]) != cnt_word.end()){
        cnt_word[E[j]]++;
      }
      else cnt_word[E[j]] = 1;
    }
  }

  vector<pair<int,int> > sortvec;
  for(map<int,int>::iterator it = cnt_word.begin();it != cnt_word.end();it++){
    if(v[it->first] == "")continue;
    sortvec.push_back(make_pair(it->second,it->first));
  }

  sort(sortvec.begin(),sortvec.end());
  reverse(sortvec.begin(),sortvec.end());

  return sortvec;
/*
  for(int i = 0;i < sortvec.size() && i < 50;i++){
    cout << sortvec[i].first << " " << sortvec[i].second << ":" << v[sortvec[i].second] << endl;
  }
*/

}
void prepare(){
	ifstream pagezero("pagezero.txt");
	int x,y;
	string s;

	int cnt = 0;
	while(pagezero >> x >> s){
		if('0' <=  s[1] && s[1] <= '9')continue;
		m[s] = x;
		v[x] = s;

		//if(++cnt % 100000 == 0)cout << cnt << endl;
	}
	pagezero.close();
	cnt = 0;
	ifstream sortedlinks("sortedlinks.txt");
	ifstream ysortedlinks("ysortedlinks.txt");
	int prev = -1,v_cnt = 0,e_cnt = 0;
	while(sortedlinks >> x >> y){
		if(++cnt % 1000000 == 0)cout << cnt << "$" << endl;
		if(x != prev)Vnext[prev] = e_cnt,prev = x,V[x] = e_cnt,v_cnt++;
		E[e_cnt] = y,e_cnt++;
	}
	cnt = 0;
	prev = -1,v_cnt = 0,e_cnt = 0;
	while(ysortedlinks >> x >> y){
		if(++cnt % 1000000 == 0)cout << cnt << "#" << endl;
		if(y != prev)Vynext[prev] = e_cnt,prev = y,Vy[y] = e_cnt,v_cnt++;
		Ey[e_cnt] = x,e_cnt++;
	}
	sortedlinks.close();
	ysortedlinks.close();

}

static void handle_sum_call(struct mg_connection *nc, struct http_message *hm) {
  char word[100];

  /* Get form variables */
  mg_get_http_var(&hm->query_string, "word", word, sizeof(word));

  vector<pair<int, int> > result = calc(word);

  /* Send headers */
  mg_printf(nc, "%s", "HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\nAccess-Control-Allow-Origin: *\r\n\r\n");

  string str = "{ \"result\": [";
  for(int i = 0;i < result.size() && i < 8;i++){
    if(i != 0)str += ",";
    str += "\"" + v[result[i].second] + "\"";
  }
  str += "] }";
  mg_printf_http_chunk(nc, "%s", str.c_str());
  mg_send_http_chunk(nc, "", 0); /* Send empty chunk, the end of response */
}

static void ev_handler(struct mg_connection *nc, int ev, void *ev_data) {
  struct http_message *hm = (struct http_message *) ev_data;

  switch (ev) {
    case MG_EV_HTTP_REQUEST:
      if (mg_vcmp(&hm->uri, "/api/v1/sum") == 0) {
        handle_sum_call(nc, hm); /* Handle RESTful call */
      } else if (mg_vcmp(&hm->uri, "/printcontent") == 0) {
        char buf[100] = {0};
        memcpy(buf, hm->body.p,
               sizeof(buf) - 1 < hm->body.len ? sizeof(buf) - 1 : hm->body.len);
        printf("%s\n", buf);
      } else {
        mg_serve_http(nc, hm, s_http_server_opts); /* Serve static content */
      }
      break;
    default:
      break;
  }
}

int main(int argc, char *argv[]) {
  struct mg_mgr mgr;
  struct mg_connection *nc;
  struct mg_bind_opts bind_opts;
  int i;
  char *cp;
  const char *err_str;
#if MG_ENABLE_SSL
  const char *ssl_cert = NULL;
#endif

  mg_mgr_init(&mgr, NULL);

  /* Use current binary directory as document root */
  if (argc > 0 && ((cp = strrchr(argv[0], DIRSEP)) != NULL)) {
    *cp = '\0';
    s_http_server_opts.document_root = argv[0];
  }

  /* Process command line options to customize HTTP server */
  for (i = 1; i < argc; i++) {
    if (strcmp(argv[i], "-D") == 0 && i + 1 < argc) {
      mgr.hexdump_file = argv[++i];
    } else if (strcmp(argv[i], "-d") == 0 && i + 1 < argc) {
      s_http_server_opts.document_root = argv[++i];
    } else if (strcmp(argv[i], "-p") == 0 && i + 1 < argc) {
      s_http_port = argv[++i];
    } else if (strcmp(argv[i], "-a") == 0 && i + 1 < argc) {
      s_http_server_opts.auth_domain = argv[++i];
    } else if (strcmp(argv[i], "-P") == 0 && i + 1 < argc) {
      s_http_server_opts.global_auth_file = argv[++i];
    } else if (strcmp(argv[i], "-A") == 0 && i + 1 < argc) {
      s_http_server_opts.per_directory_auth_file = argv[++i];
    } else if (strcmp(argv[i], "-r") == 0 && i + 1 < argc) {
      s_http_server_opts.url_rewrites = argv[++i];
#if MG_ENABLE_HTTP_CGI
    } else if (strcmp(argv[i], "-i") == 0 && i + 1 < argc) {
      s_http_server_opts.cgi_interpreter = argv[++i];
#endif
#if MG_ENABLE_SSL
    } else if (strcmp(argv[i], "-s") == 0 && i + 1 < argc) {
      ssl_cert = argv[++i];
#endif
    } else {
      fprintf(stderr, "Unknown option: [%s]\n", argv[i]);
      exit(1);
    }
  }

  /* Set HTTP server options */
  memset(&bind_opts, 0, sizeof(bind_opts));
  bind_opts.error_string = &err_str;
#if MG_ENABLE_SSL
  if (ssl_cert != NULL) {
    bind_opts.ssl_cert = ssl_cert;
  }
#endif
  nc = mg_bind_opt(&mgr, s_http_port, ev_handler, bind_opts);
  if (nc == NULL) {
    fprintf(stderr, "Error starting server on port %s: %s\n", s_http_port,
            *bind_opts.error_string);
    exit(1);
  }
  prepare();
  mg_set_protocol_http_websocket(nc);
  s_http_server_opts.enable_directory_listing = "yes";

  printf("Starting RESTful server on port %s, serving %s\n", s_http_port,
         s_http_server_opts.document_root);


  for (;;) {
    mg_mgr_poll(&mgr, 1000);
  }
  mg_mgr_free(&mgr);

  return 0;
}
