package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"sync"
)

type Post struct {
	UserID int    `json:"user_id"`
	ID     int    `json:"id"`
	Title  string `json:"title"`
	Body   string `json:"body"`
}

type job struct {
	PostID int
}

const concurrency = 5

func main() {
	postCount := 100

	jobs := make(chan job, postCount)

	go func() {
		for id := 1; id <= postCount; id++ {
			jobs <- job{
				PostID: id,
			}
		}
		close(jobs)
	}()

	var wg sync.WaitGroup

	wg.Add(concurrency)

	for i := 1; i <= concurrency; i++ {

		go func() {
			defer wg.Done()

			for job := range jobs {
				resp, err := http.Get("https://jsonplaceholder.typicode.com/posts/" + strconv.Itoa(job.PostID))
				if err != nil {
					log.Fatal(err)
				}

				defer resp.Body.Close()

				if resp.StatusCode != http.StatusOK {
					log.Fatal("Error Status not OK")
				}

				body, err := ioutil.ReadAll(resp.Body)
				if err != nil {
					log.Fatal("Error Reading Body")
				}

				var p Post
				if err := json.Unmarshal(body, &p); err != nil {
					log.Fatal("Error Unmarshaling Post")
				}

				fmt.Println(p.Title)

			}
		}()
	}

	wg.Wait()

}
